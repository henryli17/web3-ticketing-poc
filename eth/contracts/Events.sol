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
		bool sold;
	}

	struct ResaleTokenEntry {
		uint eventId;
		bool sold;
		uint idx;
	}

	// Resale Token Owner Address => ResaleTokenEntry[]
	mapping(address => ResaleTokenEntry[]) public resaleTokenEntries;

	// Event ID => ResaleToken[]
	mapping(uint => ResaleToken[]) public resaleTokens;

	// Event ID => Event
	mapping(uint => Event) public events;

	// Token Owner Address => Event IDs
	mapping(address => uint[]) public usedTokens;

	constructor() ERC1155("http://127.0.0.1:3001/api/events/{id}/metadata") {
		
	}

	function getResaleTokenEntries(address _owner) public view returns(ResaleTokenEntry[] memory) {
		return resaleTokenEntries[_owner];
	}

	function getResaleTokens(uint _eventId) public view returns(ResaleToken[] memory) {
		return resaleTokens[_eventId];
	}

	function buyToken(uint _eventId, uint _quantity) external payable {
		Event storage e = events[_eventId];

		require(e.created, "An event with this ID does not exist.");
		require(msg.value >= e.price * _quantity, "Insufficient amount of ETH provided.");
		require(e.supplied + _quantity <= e.quantity, "Maximum number of tickets have been issued.");
		require(block.timestamp < e.time, "This event has already passed.");

		e.supplied += _quantity;

		_mint(msg.sender, _eventId, _quantity, "");
	}

	function markTokenAsUsed(address _owner, uint _eventId) external onlyOwner {
		require(events[_eventId].created, "An event with this ID does not exist.");

		uint listedCount = getListedCount(msg.sender, _eventId);
		uint usedCount = getUsedCount(msg.sender, _eventId);

		require(listedCount + usedCount < balanceOf(msg.sender, _eventId), "No tickets left to mark as used.");

		usedTokens[_owner].push(_eventId);
	}

	function getListedCount(address _addr, uint _eventId) private view returns(uint) {
		ResaleTokenEntry[] storage addrResaleTokenEntries = resaleTokenEntries[_addr];
		uint listedCount = 0;

		for (uint i = 0; i < addrResaleTokenEntries.length; i++) {
			if (addrResaleTokenEntries[i].eventId == _eventId) {
				if (!addrResaleTokenEntries[i].sold) {
					listedCount++;
				}
			}
		}

		return listedCount;
	}

	function getUsedCount(address _addr, uint _eventId) private view returns(uint) {
		uint[] storage addrUsedTokens = usedTokens[_addr];
		uint usedCount = 0;

		for (uint i = 0; i < addrUsedTokens.length; i++) {
			if (addrUsedTokens[i] == _eventId) {
				usedCount++;
			}
		}

		return usedCount;
	}

	function listTokenForResale(uint _eventId, uint _quantity) external {
		require(events[_eventId].created, "An event with this ID does not exist.");

		uint listedCount = getListedCount(msg.sender, _eventId);
		uint usedCount = getUsedCount(msg.sender, _eventId);

		require(listedCount + usedCount + _quantity <= balanceOf(msg.sender, _eventId), "Insufficient number of tickets remaining.");

		ResaleTokenEntry[] storage senderResaleTokenEntries = resaleTokenEntries[msg.sender];

		for (uint i = 0; i < _quantity; i++) {
			resaleTokens[_eventId].push(
				ResaleToken({
					owner: msg.sender,
					sold: false
				})
			);

			senderResaleTokenEntries.push(
				ResaleTokenEntry({
					eventId: _eventId,
					idx: resaleTokens[_eventId].length - 1,
					sold: false
				})
			);
		}
	}

	function unlistTokenForResale(uint _eventId, uint _quantity) external {
		ResaleTokenEntry[] storage senderResaleTokenEntries = resaleTokenEntries[msg.sender];
		uint[] memory idxs = new uint[](_quantity);
		uint count = 0;
	
		for (uint i = 0; i < senderResaleTokenEntries.length; i++) {
			if (senderResaleTokenEntries[i].eventId == _eventId) {
				if (count == _quantity){
					break;
				} else if (!senderResaleTokenEntries[i].sold) {
					idxs[count++] = i;
				}
			}
		}

		require(count == _quantity, "Quantity is too large.");

		for (uint i = 0; i < idxs.length; i++) {
			senderResaleTokenEntries[idxs[i]].sold = true;
			resaleTokens[_eventId][senderResaleTokenEntries[idxs[i]].idx].sold = true;
		}
	}

	function buyResaleToken(address _owner, uint _eventId) external payable {
		require(events[_eventId].created, "An event with this ID does not exist.");
		require(msg.value >= events[_eventId].price, "Insufficient amount of ETH provided.");

		ResaleTokenEntry[] storage ownerResaleTokenEntries = resaleTokenEntries[_owner];
		address payable seller = payable(_owner);
	
		for (uint i = 0; i < ownerResaleTokenEntries.length; i++) {
			if (ownerResaleTokenEntries[i].eventId == _eventId) {
				if (!ownerResaleTokenEntries[i].sold) {
					ResaleTokenEntry storage ownerResaleTokenEntry = ownerResaleTokenEntries[i];

					_safeTransferFrom(_owner, msg.sender, _eventId, 1, "");
					seller.transfer(msg.value);

					ownerResaleTokenEntry.sold = true;
					resaleTokens[_eventId][ownerResaleTokenEntry.idx].sold = true;

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
		e.price = _price * (1 gwei);
		e.quantity = _quantity;
	}

	function getBalance() public view onlyOwner returns(uint) {
		return address(this).balance;
	}

	function transferBalance(address payable addr) external onlyOwner {
		addr.transfer(getBalance());
	}
}
