// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "./@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
  * @title Library Book NFT
  * @dev For tracking books and their owners on-chain
  */
contract LibBook is ERC721 {

    constructor() ERC721("LibBook", "LBK") public {
    }

    function mintNft(address receiver, uint256 tokenId, string memory tokenURI) public returns (uint256) {
        _mint(receiver, tokenId);
        _setTokenURI(tokenId, tokenURI);

        return tokenId;
    }
}
