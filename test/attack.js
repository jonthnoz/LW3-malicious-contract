const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Malicious External Contract", function () {
    it("Should change the owner of the Good contract", async function () {
        // Deploy the Malicious contract
        const Malicious = await ethers.getContractFactory("Malicious");
        const maliciousContract = await Malicious.deploy();
        await maliciousContract.waitForDeployment();
        console.log(
            "Malicious Contract's Address",
            maliciousContract.getAddress()
        );

        // Deploy the good contract
        const Good = await ethers.getContractFactory("Good");
        const goodContract = await Good.deploy(maliciousContract.getAddress(), {
            value: ethers.parseEther("3"),
        });
        await goodContract.waitForDeployment();
        console.log("Good Contract's Address:", goodContract.getAddress());

        const [_, addr1] = await ethers.getSigners();
        // Now lets add an address to the eligibility list
        let tx = await goodContract.connect(addr1).addUserToList();
        await tx.wait();

        // check if the user is eligible
        const eligible = await goodContract.connect(addr1).isUserEligible();
        expect(eligible).to.equal(false);
    });
});
