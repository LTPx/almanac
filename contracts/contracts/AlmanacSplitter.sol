// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title AlmanacSplitter
 * @dev Contrato inmutable que divide pagos de royalties entre artista y plataforma.
 *
 * Diseñado para ser el `royaltyReceiver` en ERC-2981.
 * Cuando un marketplace paga royalties a este contrato, el pago se divide
 * automáticamente entre el artista y la plataforma según los shares configurados.
 *
 * - Inmutable: no hay admin, no hay upgrades, no hay cambio de wallets.
 * - Push-based: la división ocurre en el momento del recibo (receive()).
 * - Sin dependencies externas.
 *
 * platformShareBps: porcentaje para la plataforma en basis points (3000 = 30%).
 *                   El artista recibe el resto (10000 - platformShareBps).
 */
contract AlmanacSplitter {
    address public immutable artistWallet;
    address public immutable platformWallet;
    uint256 public immutable platformShareBps;

    event PaymentSplit(
        uint256 totalAmount,
        uint256 artistAmount,
        uint256 platformAmount
    );

    constructor(
        address artistWallet_,
        address platformWallet_,
        uint256 platformShareBps_
    ) {
        require(artistWallet_ != address(0), "AlmanacSplitter: artist cannot be zero");
        require(platformWallet_ != address(0), "AlmanacSplitter: platform cannot be zero");
        require(platformShareBps_ > 0, "AlmanacSplitter: platform share must be > 0");
        require(platformShareBps_ < 10000, "AlmanacSplitter: platform share must be < 100%");

        artistWallet = artistWallet_;
        platformWallet = platformWallet_;
        platformShareBps = platformShareBps_;
    }

    receive() external payable {
        if (msg.value == 0) return;

        uint256 platformAmount = (msg.value * platformShareBps) / 10000;
        uint256 artistAmount = msg.value - platformAmount;

        if (platformAmount > 0) {
            (bool okPlatform,) = platformWallet.call{value: platformAmount}("");
            require(okPlatform, "AlmanacSplitter: platform transfer failed");
        }

        if (artistAmount > 0) {
            (bool okArtist,) = artistWallet.call{value: artistAmount}("");
            require(okArtist, "AlmanacSplitter: artist transfer failed");
        }

        emit PaymentSplit(msg.value, artistAmount, platformAmount);
    }
}
