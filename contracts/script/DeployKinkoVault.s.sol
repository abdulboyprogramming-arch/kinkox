// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {KinkoVault} from "src/KinkoVault.sol";

contract DeployKinkoVault is Script {

    function run() external returns (KinkoVault) {
        vm.startBroadcast();
        KinkoVault kinkoVault = new KinkoVault();
        console.log("Address of KinkoVault: ", address(kinkoVault));
        vm.stopBroadcast();
        return kinkoVault;
    }
}