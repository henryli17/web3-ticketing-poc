// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.8.0;
pragma abicoder v2;

import "openzeppelin-solidity/contracts/token/ERC1155/ERC1155.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";

contract Events is ERC1155, Ownable {
	struct Event {
		string name;
		uint time;
		uint price;
		uint quantity;
		uint supplied;
	}

	struct ResaleToken {
		address owner;
		uint price;
	}

	struct ResaleTokenEntry {
		uint eventId;
		uint price;
		uint idx;
	}

	// Address => Array of indices for tokensForResale array
	mapping(address => ResaleTokenEntry[]) resaleTokenEntries;

	// Event ID => Array of Resale Tokens
	mapping(uint => ResaleToken[]) resaleTokens;

	// ID => Event
	mapping(uint => Event) private events;

	constructor() ERC1155("metadataURI") {
		// List resale: 
		/**
		 * API endpoint
		 * Add ResaleToken to resaleTokens, get index, add to tokensForResaleIdx
		 */

		// Unlist resale:
		/**
		 * API endpoint
		 * Remove from resaleTokens, remove from tokensForResaleIdx
		 */

		// Buy resale:
		/**
		 * tokensForResale(eventId)
		 * Transfer token to buyer -> Send ETH to ResaleToken.owner
		 * Unlist resale 
		 * Remove ResaleToken from DB? Inconsistent
		 */
	}

	function buyTicket(uint _id, uint _quantity) external payable {
		Event storage e = events[_id];

		require(msg.value <= e.price * _quantity, "Insufficient amount of ETH provided.");
		require(e.supplied + _quantity < e.quantity, "Maximum number of tickets have been issued.");
		require(block.timestamp < e.time, "This event has already passed.");

		e.supplied += _quantity;

		_mint(msg.sender, _id, 1, "");
	}

	function listTokenForResale(uint _eventId, uint _price) public {
		ResaleTokenEntry[] storage entries = resaleTokenEntries[msg.sender];
		uint listedCount = 0;

		for (uint i = 0; i < entries.length; i++) {
			if (entries[i].eventId == _eventId && entries[i].price != 0) {
				listedCount++;
			}
		}

		require(listedCount < balanceOf(msg.sender, _eventId), "No more tickets to list.");
		// TODO: add price validation check

		resaleTokens[_eventId].push(
			ResaleToken({
				owner: msg.sender,
				price: _price
			})
		);

		entries.push(
			ResaleTokenEntry({
				eventId: _eventId,
				idx: resaleTokens[_eventId].length - 1,
				price: _price
			})
		);
	}

	function unlistTokenForResale(uint _eventId, uint _price) public returns (bool) {
		ResaleTokenEntry[] storage rtes = resaleTokenEntries[msg.sender];
	
		for (uint i = 0; i < rtes.length; i++) {
			if (rtes[i].eventId == _eventId && rtes[i].price == _price) {
				ResaleToken[] storage rts = resaleTokens[_eventId];

				rtes[i].price = 0;
				rts[rtes[i].idx].price = 0;

				return true;
			}
		}

		return false;
	}

	function createEvent(uint _id, string memory _name, uint _time, uint _price, uint _quantity) external onlyOwner {
		events[_id] = Event({
			name: _name,
			time: _time,
			price: _price,
			quantity: _quantity,
			supplied: 0
		});
	}
}
