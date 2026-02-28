import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { AlmanacCertificate } from "../typechain-types";

describe("AlmanacCertificate", function () {
  let contract: AlmanacCertificate;
  let admin: SignerWithAddress;
  let minter: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  const NAME = "Almanac Certificate";
  const SYMBOL = "ALMCERT";
  const MAX_SUPPLY = 100;
  const TOKEN_URI = "ipfs://QmCertificate123";

  const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));

  beforeEach(async function () {
    [admin, minter, user1, user2] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("AlmanacCertificate");
    contract = (await upgrades.deployProxy(
      Factory,
      [NAME, SYMBOL, MAX_SUPPLY, admin.address],
      { kind: "uups" }
    )) as unknown as AlmanacCertificate;
    await contract.waitForDeployment();

    await contract.connect(admin).grantRole(MINTER_ROLE, minter.address);
  });

  // ===========================================================================
  // Inicializacion
  // ===========================================================================

  describe("Inicializacion", function () {
    it("debe configurar nombre y simbolo", async function () {
      expect(await contract.name()).to.equal(NAME);
      expect(await contract.symbol()).to.equal(SYMBOL);
    });

    it("debe configurar MAX_SUPPLY", async function () {
      expect(await contract.MAX_SUPPLY()).to.equal(MAX_SUPPLY);
    });

    it("debe inicializar totalMinted en 0", async function () {
      expect(await contract.totalMinted()).to.equal(0);
    });

    it("debe otorgar DEFAULT_ADMIN_ROLE y MINTER_ROLE al admin", async function () {
      const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
      expect(await contract.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to.be.true;
      expect(await contract.hasRole(MINTER_ROLE, admin.address)).to.be.true;
    });

    it("debe revertir si maxSupply es 0", async function () {
      const Factory = await ethers.getContractFactory("AlmanacCertificate");
      await expect(
        upgrades.deployProxy(Factory, [NAME, SYMBOL, 0, admin.address], { kind: "uups" })
      ).to.be.revertedWith("AlmanacCertificate: maxSupply must be > 0");
    });

    it("debe revertir si admin es address(0)", async function () {
      const Factory = await ethers.getContractFactory("AlmanacCertificate");
      await expect(
        upgrades.deployProxy(Factory, [NAME, SYMBOL, MAX_SUPPLY, ethers.ZeroAddress], { kind: "uups" })
      ).to.be.revertedWith("AlmanacCertificate: admin cannot be zero address");
    });
  });

  // ===========================================================================
  // Mint
  // ===========================================================================

  describe("mint", function () {
    it("debe mintear un certificado al usuario", async function () {
      await contract.connect(minter).mint(user1.address, TOKEN_URI);
      expect(await contract.ownerOf(0)).to.equal(user1.address);
    });

    it("debe asignar el URI correcto", async function () {
      await contract.connect(minter).mint(user1.address, TOKEN_URI);
      expect(await contract.tokenURI(0)).to.equal(TOKEN_URI);
    });

    it("debe asignar IDs secuenciales (0, 1, 2...)", async function () {
      await contract.connect(minter).mint(user1.address, TOKEN_URI);
      await contract.connect(minter).mint(user2.address, "ipfs://QmSecond");

      expect(await contract.ownerOf(0)).to.equal(user1.address);
      expect(await contract.ownerOf(1)).to.equal(user2.address);
    });

    it("debe incrementar totalMinted", async function () {
      await contract.connect(minter).mint(user1.address, TOKEN_URI);
      expect(await contract.totalMinted()).to.equal(1);
    });

    it("debe emitir eventos Locked y CertificateMinted", async function () {
      await expect(contract.connect(minter).mint(user1.address, TOKEN_URI))
        .to.emit(contract, "Locked").withArgs(0)
        .and.to.emit(contract, "CertificateMinted").withArgs(user1.address, 0, TOKEN_URI);
    });

    it("debe revertir si no tiene MINTER_ROLE", async function () {
      await expect(
        contract.connect(user1).mint(user1.address, TOKEN_URI)
      ).to.be.revertedWithCustomError(contract, "AccessControlUnauthorizedAccount");
    });

    it("debe revertir mint a address(0)", async function () {
      await expect(
        contract.connect(minter).mint(ethers.ZeroAddress, TOKEN_URI)
      ).to.be.revertedWith("AlmanacCertificate: mint to zero address");
    });
  });

  // ===========================================================================
  // Supply fijo
  // ===========================================================================

  describe("Supply fijo (MAX_SUPPLY)", function () {
    it("debe revertir cuando se alcanza MAX_SUPPLY", async function () {
      const Factory = await ethers.getContractFactory("AlmanacCertificate");
      const small = (await upgrades.deployProxy(
        Factory, [NAME, SYMBOL, 2, admin.address], { kind: "uups" }
      )) as unknown as AlmanacCertificate;

      await small.connect(admin).mint(user1.address, TOKEN_URI);
      await small.connect(admin).mint(user1.address, TOKEN_URI);

      await expect(
        small.connect(admin).mint(user1.address, TOKEN_URI)
      ).to.be.revertedWith("AlmanacCertificate: max supply reached");
    });

    it("remainingSupply debe decrementar con cada mint", async function () {
      expect(await contract.remainingSupply()).to.equal(MAX_SUPPLY);
      await contract.connect(minter).mint(user1.address, TOKEN_URI);
      expect(await contract.remainingSupply()).to.equal(MAX_SUPPLY - 1);
    });
  });

  // ===========================================================================
  // Soulbound — no transfer
  // ===========================================================================

  describe("Soulbound (no transfer)", function () {
    beforeEach(async function () {
      await contract.connect(minter).mint(user1.address, TOKEN_URI);
    });

    it("NO se puede transferir con transferFrom", async function () {
      await expect(
        contract.connect(user1).transferFrom(user1.address, user2.address, 0)
      ).to.be.revertedWith("AlmanacCertificate: soulbound, cannot transfer or burn");
    });

    it("NO se puede transferir con safeTransferFrom", async function () {
      await expect(
        contract.connect(user1)["safeTransferFrom(address,address,uint256)"](
          user1.address, user2.address, 0
        )
      ).to.be.revertedWith("AlmanacCertificate: soulbound, cannot transfer or burn");
    });

    it("locked() debe retornar true siempre", async function () {
      expect(await contract.locked(0)).to.be.true;
    });
  });

  // ===========================================================================
  // No burn
  // ===========================================================================

  describe("No burn", function () {
    it("locked() debe revertir para token inexistente", async function () {
      await expect(contract.locked(999)).to.be.revertedWith(
        "AlmanacCertificate: token does not exist"
      );
    });
  });

  // ===========================================================================
  // supportsInterface
  // ===========================================================================

  describe("supportsInterface", function () {
    it("debe soportar ERC-5192 (0xb45a3c0e)", async function () {
      expect(await contract.supportsInterface("0xb45a3c0e")).to.be.true;
    });

    it("debe soportar ERC-721 (0x80ac58cd)", async function () {
      expect(await contract.supportsInterface("0x80ac58cd")).to.be.true;
    });
  });

  // ===========================================================================
  // Upgradeability
  // ===========================================================================

  describe("Upgradeability (UUPS)", function () {
    it("solo DEFAULT_ADMIN_ROLE puede upgradear", async function () {
      const Factory = await ethers.getContractFactory("AlmanacCertificate", user1);
      await expect(
        upgrades.upgradeProxy(await contract.getAddress(), Factory)
      ).to.be.revertedWithCustomError(contract, "AccessControlUnauthorizedAccount");
    });

    it("admin puede upgradear y el estado persiste", async function () {
      await contract.connect(minter).mint(user1.address, TOKEN_URI);

      const FactoryV2 = await ethers.getContractFactory("AlmanacCertificate");
      const upgraded = (await upgrades.upgradeProxy(
        await contract.getAddress(), FactoryV2
      )) as unknown as AlmanacCertificate;

      expect(await upgraded.totalMinted()).to.equal(1);
      expect(await upgraded.ownerOf(0)).to.equal(user1.address);
    });
  });
});
