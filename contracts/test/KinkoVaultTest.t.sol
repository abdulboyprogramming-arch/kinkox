// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {DeployKinkoVault, KinkoVault} from "script/DeployKinkoVault.s.sol";

contract RejectEther {
    // No receive() or fallback() — any ETH transfer will fail
    
    function withdraw(KinkoVault vault) external {
        vault.withdraw(); // This will trigger the revert
    }
}

contract KinkoVaultTest is Test {

    error KinkoVault__LockPeriodNotExpired(); // Error for when a user tries to withdraw before the lock period has expired
    error KinkoVault__TransferFailed(); // Error for when a transfer of funds fails
    error KinkoVault__AlreadyWithdrawn(); // Error for when a user tries to withdraw funds that have already been withdrawn
    error KinkoVault__ExistingPosition(); // Error for when a user tries to deposit funds while already having an active position
    error KinkoVault__InvalidDuration(); // Error for when a user provides an invalid lock duration
    error KinkoVault__AmountMustBeGreaterThanZero(); // Error for when a user tries to deposit an amount that is not greater than zero
    error KinkoVault__NoActivePosition(); // Error for when a user tries to withdraw funds without having an active position

    DeployKinkoVault deployKinkoVault;
    KinkoVault kinkoVault;
    RejectEther attacker;

    address USER = makeAddr("user");
    uint256 constant MIN_LOCK_DURATION = 30 days;

    function setUp() public {
        deployKinkoVault = new DeployKinkoVault();
        kinkoVault = deployKinkoVault.run();
        attacker = new RejectEther();
        vm.deal(USER, 2e18);
        vm.deal(address(attacker), 2e18);
        vm.deal(address(kinkoVault), 10e18);
    }

    function testUserCanDepositAndHaveExistingPosition() public {
        vm.prank(USER);
        kinkoVault.deposit{value: 1e18}(MIN_LOCK_DURATION);

        (uint256 amount, uint256 startTime, uint256 endTime, bool withdrawn) = kinkoVault.getUserPosition(USER);
        assertEq(amount, 1e18);
        assertEq(startTime, block.timestamp);
        assertEq(endTime, MIN_LOCK_DURATION);
        assertEq(withdrawn, false);
    }

    function testUserCannotDepositWithExistingPosition() public {
        vm.prank(USER);
        kinkoVault.deposit{value: 1e18}(MIN_LOCK_DURATION);

        vm.prank(USER);
        vm.expectRevert(KinkoVault.KinkoVault__ExistingPosition.selector);
        kinkoVault.deposit{value: 1e18}(MIN_LOCK_DURATION);
    }

    function testUserCanWithdrawAfterLockPeriodHasExpired() public {
        vm.prank(USER);
        kinkoVault.deposit{value: 1e18}(MIN_LOCK_DURATION);

        vm.warp(MIN_LOCK_DURATION);
        vm.prank(USER);
        kinkoVault.withdraw();
    }

    function testRevertsUserCannotWithdrawAfterLockedPeriodIsNotExpired() public {
        vm.prank(USER);
        kinkoVault.deposit{value: 1e18}(MIN_LOCK_DURATION);

        vm.warp(kinkoVault.getMinLockDuration() - 1 days);
        vm.prank(USER);
        vm.expectRevert(KinkoVault.KinkoVault__LockPeriodNotExpired.selector);
        kinkoVault.withdraw();
    }

    function testRevertsUserCannotWithdrawMoreThanOnce() public {
        vm.prank(USER);
        kinkoVault.deposit{value: 1e18}(MIN_LOCK_DURATION);

        vm.warp(kinkoVault.getMinLockDuration());
        vm.prank(USER);
        kinkoVault.withdraw();

        vm.prank(USER);
        vm.expectRevert(KinkoVault.KinkoVault__NoActivePosition.selector);
        kinkoVault.withdraw();
    }

    function testUserCannotDepositLessThanTheMinLockDuration() public {
        vm.prank(USER);
        vm.expectRevert("Lock duration must be at least 30 days");
        kinkoVault.deposit{value: 1e18}(MIN_LOCK_DURATION - 1 days);
    }

    function testUserCannotDepositMoreThanTheMaxLockDuration() public {
        uint256 extraLockDuration = kinkoVault.getMaxLockDuration() + 1 days;
        vm.prank(USER);
        vm.expectRevert("Lock duration must be at most 1826 days");
        kinkoVault.deposit{value: 1e18}(extraLockDuration);
    }

    function testReceiveFunctionReverts() public {
        vm.prank(USER);
        vm.expectRevert("Direct deposits not allowed. Please use the deposit function.");
        (bool success, ) = address(kinkoVault).call{value: 1e18}("");
    }

    function testFallbackFunctionReverts() public {
        vm.prank(USER);
        vm.expectRevert("Direct deposits not allowed. Please use the deposit function.");
        (bool success, ) = address(kinkoVault).call{value: 1e18}(abi.encodeWithSignature("nonExistentFunction()"));
    }

    function testRevertsUserCannotWithdrawIfTransferFails() public {
        vm.prank(address(attacker));
        kinkoVault.deposit{value: 1e18}(MIN_LOCK_DURATION);

        vm.warp(MIN_LOCK_DURATION);
        vm.prank(address(attacker));
        vm.expectRevert(KinkoVault.KinkoVault__TransferFailed.selector);
        attacker.withdraw(kinkoVault);
    }

    function testRevertsInvalidDuration() public {
        vm.prank(USER);
        vm.expectRevert(KinkoVault.KinkoVault__InvalidDuration.selector);
        kinkoVault.deposit{value: 1e18}(0);
    }

    function testRevertsAmountMustBeGreaterThanZero() public {
        vm.prank(USER);
        vm.expectRevert(KinkoVault.KinkoVault__AmountMustBeGreaterThanZero.selector);
        kinkoVault.deposit{value: 0}(MIN_LOCK_DURATION);
    }

    function testRevertsUserTryingToDepositAgainWithExistingPosition() public {
        vm.prank(USER);
        kinkoVault.deposit{value: 1e18}(MIN_LOCK_DURATION);

        vm.prank(USER);
        vm.expectRevert(KinkoVault.KinkoVault__ExistingPosition.selector);
        kinkoVault.deposit{value: 1e18}(MIN_LOCK_DURATION);
    }

    function testExpectEventDeposit() public {
        vm.prank(USER);
        vm.expectEmit(true, true, true, true);
        emit KinkoVault.Deposit(USER, 1e18, MIN_LOCK_DURATION);
        kinkoVault.deposit{value: 1e18}(MIN_LOCK_DURATION);
    }

    function testExpectEventWithdraw() public {
        vm.prank(USER);
        kinkoVault.deposit{value: 1e18}(MIN_LOCK_DURATION);

        vm.warp(MIN_LOCK_DURATION);
        vm.prank(USER);
        vm.expectEmit(true, false, false, true);
        emit KinkoVault.Withdrawal(USER, 1e18);
        kinkoVault.withdraw();
    }
}