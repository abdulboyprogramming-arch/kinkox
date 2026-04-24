// users deposit eth into the contract
// Users can have position, a struct that can track alot of things
// Struct -> Position = {uint256 amountDeposited, uint256 startTime, uint256 lockedTime, bool withdrawn}
// deposit(uint256 duration)
// withdraw()
// earlywithDraw(uint256 amount) - will take a percentage of the total money in the account.
// extendLock(uint256 duration) - we have to ensure that the user has not withdrawn yet.

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title Kinko Vault
 * @author Akinjeji Oluwaferanmi
 * @notice This contract allows users to deposit Ether and lock it for a specified duration.
 * Users can withdraw their funds after the lock period has expired.
 * The contract also includes error handling for various scenarios such as insufficient funds, invalid duration, and transfer failures.
 * The contract uses custom errors to provide more informative error messages and to save gas compared to traditional revert strings.
 * @dev The contract uses a struct to track user positions, including the amount deposited, start time, end time, and withdrawal status.
 * @dev The contract emits events for deposits and withdrawals to allow for easy tracking of user interactions with the vault.
 */
contract KinkoVault {
    // ===========================================================
    // │                          ERRORS                         │
    // ===========================================================
    error KinkoVault__LockPeriodNotExpired(); // Error for when a user tries to withdraw before the lock period has expired
    error KinkoVault__TransferFailed(); // Error for when a transfer of funds fails
    error KinkoVault__AlreadyWithdrawn(); // Error for when a user tries to withdraw funds that have already been withdrawn
    error KinkoVault__ExistingPosition(); // Error for when a user tries to deposit funds while already having an active position
    error KinkoVault__InvalidDuration(); // Error for when a user provides an invalid lock duration
    error KinkoVault__AmountMustBeGreaterThanZero(); // Error for when a user tries to deposit an amount that is not greater than zero
    error KinkoVault__NoActivePosition(); // Error for when a user tries to withdraw funds without having an active position

    // ===========================================================
    // │                          EVENTS                         │
    // ===========================================================
    // Event emitted when a user makes a deposit, including the user's address, the amount deposited, and the lock duration
    event Deposit(address indexed user, uint256 amount, uint256 duration); 

    // Event emitted when a user withdraws funds, including the user's address and the amount withdrawn
    event Withdrawal(address indexed user, uint256 amount); 

    // Struct to represent a user's position in the vault, including the amount deposited, start time, end time, and withdrawal status.
    struct Position {
        uint256 amount;
        uint256 startTime;
        uint256 endTime;
        bool withdrawn;
    }

    uint256 private constant MIN_LOCK_DURATION = 30 days; // Minimum lock duration to encourage long term deposits
    uint256 private constant MAX_LOCK_DURATION = 1826 days; // 5 years in days, to prevent excessively long lock durations.

    // Mapping to track user positions based on their address.
    mapping(address => Position) private userPosition;

    // Mapping to track whether a user has interacted with the vault.
    mapping(address => bool) private isUser;

    // =========================================================== 
    // │                    EXTERNAL FUNCTIONS                   │ 
    // ===========================================================
    /**
     * @notice Allows users to deposit Ether into the vault and lock it for a specified duration.
     * @param duration The duration for which the funds will be locked.
     * @dev The function is payable, allowing users to send Ether along with the transaction. 
     * Requirements:
     * - The deposit amount must be greater than zero.
     * - The lock duration must be greater than zero.
     * - The user must not have an existing active position.
     * - The user must not have already withdrawn funds from a previous position.
     * - The user cannot set the lock duration to be less than the minimum lock duration or greater than the maximum lock duration.
     * Emits a {Deposit} event with the user's address, the amount deposited, and the lock duration.
     */
    function deposit(uint256 duration) external payable {
        require(msg.value > 0, KinkoVault__AmountMustBeGreaterThanZero()); // Ensure that the deposit amount is greater than zero
        require(duration > 0, KinkoVault__InvalidDuration()); // Ensure that the lock duration is greater than zero
        require(duration >= MIN_LOCK_DURATION, "Lock duration must be at least 30 days"); // Ensure that the lock duration is not less than the minimum lock duration
        require(duration <= MAX_LOCK_DURATION, "Lock duration must be at most 1826 days"); // Ensure that the lock duration is not greater than the maximum lock duration
        require(userPosition[msg.sender].amount == 0, KinkoVault__ExistingPosition()); // Ensure that the user does not have an existing active position
        require(userPosition[msg.sender].withdrawn == false, KinkoVault__AlreadyWithdrawn()); // Ensure that the user has not already withdrawn funds from a previous position       
        require(isUser[msg.sender] == false, KinkoVault__AlreadyWithdrawn()); // Ensure that the user has not already withdrawn funds from a previous position by checking the isUser mapping

        uint256 startTime = block.timestamp; // Get the current block timestamp as the start time for the position

        userPosition[msg.sender] =
            Position({amount: msg.value, startTime: startTime, endTime: duration, withdrawn: false}); // Create a new position for the user with the deposited amount, start time, end time, and withdrawal status
        isUser[msg.sender] = true; // Mark the user as having interacted with the vault to allow for future checks on whether they have an active position or have withdrawn funds
        emit Deposit(msg.sender, msg.value, duration); // Emit a Deposit event with the user's address, the amount deposited, and the lock duration
    }

    /**
     * @notice Allows users to withdraw their funds from the vault after the lock period has expired.
     * Requirements:
     * - The lock period must have expired before allowing the user to withdraw funds.
     * - The user must not have already withdrawn funds from this position.
     * - The user must have an active position in the vault to withdraw funds.
     * Emits a {Withdrawal} event with the user's address and the amount withdrawn.
     */
    function withdraw() external {
        require(isUser[msg.sender], KinkoVault__NoActivePosition()); // Ensure that the user has an active position before allowing them to withdraw funds
        Position storage position = userPosition[msg.sender];
        require(
            block.timestamp >= position.endTime,
            KinkoVault__LockPeriodNotExpired()
        ); // Ensure that the lock period has expired before allowing the user to withdraw funds, providing the remaining time until the lock expires in the error message if the lock period has not yet expired
        require(!position.withdrawn, KinkoVault__AlreadyWithdrawn()); // Ensure that the user has not already withdrawn funds from this position

        uint256 amountToWithdraw = position.amount; // Store the amount to withdraw before setting it to zero to prevent reentrancy attacks
        position.amount = 0; // Set amount to zero before transfer to prevent reentrancy attacks
        position.withdrawn = true; // Mark the position as withdrawn to prevent multiple withdrawals from the same position
        isUser[msg.sender] = false; // Mark the user as no longer having an active position to allow for future deposits and withdrawals
        (bool success,) = payable(msg.sender).call{value: amountToWithdraw}(""); // Attempt to transfer the withdrawn amount back to the user, using call to handle potential issues with gas limits and to allow for receiving Ether in case the user's address is a contract
        if (!success) {
            revert KinkoVault__TransferFailed(); // Revert the transaction if the transfer fails, providing a custom error message for better clarity and to save gas compared to using a revert string
        }

        emit Withdrawal(msg.sender, amountToWithdraw); // Emit a Withdrawal event with the user's address and the amount withdrawn to allow for easy tracking of user interactions with the vault
    }

    receive() external payable {
        revert("Direct deposits not allowed. Please use the deposit function."); // Revert any direct Ether transfers to the contract, providing a clear message to users to use the deposit function instead
    }

    fallback() external payable {
        revert("Direct deposits not allowed. Please use the deposit function."); // Revert any calls to non-existent functions or direct Ether transfers to the contract, providing a clear message to users to use the deposit function instead
    }

    // =========================================================== 
    // │                     GETTER FUNCTIONS                    │ 
    // ===========================================================
    function getUserPosition(address user) public view returns (uint256 amount, uint256 startTime, uint256 endTime, bool withdrawn) {
        // Return the user's position struct, allowing external callers to view the details of a user's position in the vault
        Position memory position = userPosition[user]; 
        return(position.amount, position.startTime, position.endTime, position.withdrawn);
    }

    function getMaxLockDuration() public pure returns (uint256) {
        // Return the maximum lock duration, allowing external callers to view the maximum lock duration for deposits in the vault
        return MAX_LOCK_DURATION; 
    }

    function getMinLockDuration() public pure returns (uint256) {
        // Return the minimum lock duration, allowing external callers to view the minimum lock duration for deposits in the vault
        return MIN_LOCK_DURATION; 
    }
}
