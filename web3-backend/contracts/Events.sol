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
		uint eventId;
		uint price;
		uint quantity;
	}

	// ID => Event
	mapping(uint => Event) private events;

	constructor() ERC1155("metadataURI") {

	}

	function buyTicket(uint _id, uint _quantity) external payable {
		Event storage e = events[_id];

		require(msg.value <= e.price * _quantity, "Insufficient amount of ETH provided.");
		require(e.supplied + _quantity < e.quantity, "Maximum number of tickets have been issued.");
		require(block.timestamp < e.time, "This event has already passed.");

		e.supplied += _quantity;

		_mint(msg.sender, _id, 1, "");
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

    function getEvent(uint _id) external returns(Event memory) {
        return events[_id];
    }
}
