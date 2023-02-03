// SPDX-License-Identifier: MIT

pragma solidity ^0.8.16;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Events is ERC1155, Ownable {
	struct Event {
		string name;
		uint time;
		uint price;
		uint quantity;
		uint supplied;
		bool created;
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

	// Resale Token Owner Address => ResaleTokenEntry[]
	mapping(address => ResaleTokenEntry[]) public resaleTokenEntries;

	// Event ID => ResaleToken[]
	mapping(uint => ResaleToken[]) public resaleTokens;

	// Event ID => Event
	mapping(uint => Event) public events;

	constructor() ERC1155("metadataURI") {}

	function buyToken(uint _eventId, uint _quantity) external payable {
		Event storage e = events[_eventId];

		require(msg.value >= e.price * _quantity, "Insufficient amount of ETH provided.");
		require(e.supplied + _quantity <= e.quantity, "Maximum number of tickets have been issued.");
		require(block.timestamp < e.time, "This event has already passed.");

		e.supplied += _quantity;

		_mint(msg.sender, _eventId, 1, "");
	}

	function listTokenForResale(uint _eventId, uint _price) external {
		ResaleTokenEntry[] storage senderResaleTokenEntries = resaleTokenEntries[msg.sender];
		uint numerator = 110;
		uint denominator = 100;
		uint listedCount = 0;

		for (uint i = 0; i < senderResaleTokenEntries.length; i++) {
			if (senderResaleTokenEntries[i].eventId == _eventId) {
				if (senderResaleTokenEntries[i].price != 0) {
					listedCount++;
				}
			}
		}

		require(listedCount < balanceOf(msg.sender, _eventId), "No more tickets to list.");
		require(_price <= events[_eventId].price * (numerator / denominator), "Invalid price.");

		resaleTokens[_eventId].push(
			ResaleToken({
				owner: msg.sender,
				price: _price
			})
		);

		senderResaleTokenEntries.push(
			ResaleTokenEntry({
				eventId: _eventId,
				idx: resaleTokens[_eventId].length - 1,
				price: _price
			})
		);
	}

	function unlistTokenForResale(uint _eventId, uint _price) external {
		ResaleTokenEntry[] storage senderResaleTokenEntries = resaleTokenEntries[msg.sender];
	
		for (uint i = 0; i < senderResaleTokenEntries.length; i++) {
			if (senderResaleTokenEntries[i].eventId == _eventId) {
				if (senderResaleTokenEntries[i].price == _price) {
					senderResaleTokenEntries[i].price = 0;
					resaleTokens[_eventId][senderResaleTokenEntries[i].idx].price = 0;
					return;
				}
			}
		}

		revert("Invalid parameters.");
	}

	function buyResaleToken(address _owner, uint _eventId, uint _price) external payable {
		require(msg.value >= _price, "Insufficient amount of ETH provided.");

		ResaleTokenEntry[] storage ownerResaleTokenEntries = resaleTokenEntries[_owner];
		address payable seller = payable(_owner);
	
		for (uint i = 0; i < ownerResaleTokenEntries.length; i++) {
			if (ownerResaleTokenEntries[i].eventId == _eventId) {
				if (ownerResaleTokenEntries[i].price == _price) {
					ResaleTokenEntry storage ownerResaleTokenEntry = ownerResaleTokenEntries[i];

					_safeTransferFrom(_owner, msg.sender, _eventId, 1, "");
					seller.transfer(msg.value);

					// Mark resale token as sold
					ownerResaleTokenEntry.price = 0;
					resaleTokens[_eventId][ownerResaleTokenEntry.idx].price = 0;

					return;
				}
			}
		}

		revert("Invalid parameters.");
	}

	function createEvent(uint _id, string memory _name, uint _time, uint _price, uint _quantity) external onlyOwner {
		Event storage e = events[_id];

		require(e.created == false, "An event with this ID has already been created.");
		require(_price > 0, "Price must be greater than 0.");
		require(_quantity > 0, "Quantity must be greater than 0.");

		events[_id] = Event({
			name: _name,
			time: _time,
			price: _price * (1 gwei),
			quantity: _quantity,
			supplied: 0,
			created: true
		});
	}

	function updateEvent(uint _id, string memory _name, uint _time, uint _price, uint _quantity) external onlyOwner {
		Event storage e = events[_id];

		require(e.created == true, "An event with this ID does not exist.");
		require(_price > 0, "Price must be greater than 0.");
		require(_quantity >= e.supplied, "Quantity must be greater or equal than what has been supplied already.");
		require(_quantity > 0, "Quantity must be greater than 0.");

		e.name = _name;
		e.time = _time;
		e.price = _price;
		e.quantity = _quantity;
	}
}
