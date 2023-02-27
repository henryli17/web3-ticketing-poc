// SPDX-License-Identifier: MIT

pragma solidity ^0.8.16;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Events is ERC1155, Ownable {
	struct Event {
		uint time;
		uint price;
		uint quantity;
		uint supplied;
		bool created;
		bool cancelled;
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

	constructor() ERC1155("https://muddy-sunset-2817.fly.dev/api/events/{id}/metadata") {
		
	}

	function getResaleTokenEntries(address _owner) public view returns(ResaleTokenEntry[] memory) {
		return resaleTokenEntries[_owner];
	}

	function getResaleTokens(uint _eventId) public view returns(ResaleToken[] memory) {
		return resaleTokens[_eventId];
	}

	function getUsedTokens(address _owner) public view returns(uint[] memory) {
		return usedTokens[_owner];
	}

	function buyToken(uint _eventId, uint _quantity) external payable {
		Event storage e = events[_eventId];

		require(e.created, "An event with this ID does not exist.");
		require(!e.cancelled, "This event has been cancelled.");
		require(msg.value >= e.price * _quantity, "Insufficient amount of ETH provided.");
		require(e.supplied + _quantity <= e.quantity, "Maximum number of tickets have been issued.");
		require(block.timestamp < e.time, "This event has already passed.");

		e.supplied += _quantity;

		_mint(msg.sender, _eventId, _quantity, "");
	}

	function markTokenAsUsed(address _owner, uint _eventId, uint _quantity) external onlyOwner {
		Event storage e = events[_eventId];

		require(e.created, "An event with this ID does not exist.");
		require(!e.cancelled, "This event has been cancelled.");

		uint listedCount = getListedCount(_owner, _eventId);
		uint usedCount = getUsedCount(_owner, _eventId);

		require(listedCount + usedCount + _quantity <= balanceOf(_owner, _eventId), "Insufficient tickets remaining.");

		for (uint i = 0; i < _quantity; i++) {
			usedTokens[_owner].push(_eventId);
		}
	}

	function getListedCount(address _addr, uint _eventId) public view returns(uint) {
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

	function getUsedCount(address _addr, uint _eventId) public view returns(uint) {
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
		Event storage e = events[_eventId];

		require(e.created, "An event with this ID does not exist.");
		require(!e.cancelled, "This event has been cancelled.");

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
		Event storage e = events[_eventId];

		require(e.created, "An event with this ID does not exist.");
		require(!e.cancelled, "This event has been cancelled.");

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
		Event storage e = events[_eventId];

		require(e.created, "An event with this ID does not exist.");
		require(!e.cancelled, "This event has been cancelled.");
		require(msg.value >= e.price, "Insufficient amount of ETH provided.");

		ResaleTokenEntry[] storage ownerResaleTokenEntries = resaleTokenEntries[_owner];
	
		for (uint i = 0; i < ownerResaleTokenEntries.length; i++) {
			if (ownerResaleTokenEntries[i].eventId == _eventId) {
				if (!ownerResaleTokenEntries[i].sold) {
					ResaleTokenEntry storage ownerResaleTokenEntry = ownerResaleTokenEntries[i];

					_safeTransferFrom(_owner, msg.sender, _eventId, 1, "");
					payable(_owner).transfer(msg.value);

					ownerResaleTokenEntry.sold = true;
					resaleTokens[_eventId][ownerResaleTokenEntry.idx].sold = true;

					return;
				}
			}
		}

		revert("Invalid parameters.");
	}

	function createEvent(uint _id, uint _time, uint _price, uint _quantity) external onlyOwner {
		Event storage e = events[_id];

		require(!e.created, "An event with this ID has already been created.");
		require(_quantity > 0, "Quantity must be greater than 0.");
		require(_time > block.timestamp, "Time needs to be in the future.");

		events[_id] = Event({
			time: _time,
			price: _price * (1 gwei),
			quantity: _quantity,
			supplied: 0,
			created: true,
			cancelled: false
		});
	}

	function updateEvent(uint _id, uint _time, uint _quantity) external onlyOwner {
		Event storage e = events[_id];

		require(e.created, "An event with this ID does not exist.");
		require(!e.cancelled, "This event has been cancelled.");
		require(_quantity >= e.supplied, "Quantity must be greater or equal than what has been supplied already.");
		require(_quantity > 0, "Quantity must be greater than 0.");
		require(_time > block.timestamp, "Time needs to be in the future.");

		e.time = _time;
		e.quantity = _quantity;
	}

	function cancelEvent(uint _id, address[] calldata owners, uint[] calldata quantity) external onlyOwner {
		Event storage e = events[_id];
		uint totalTransferAmount = 0;

		require(e.created, "An event with this ID does not exist.");
		require(!e.cancelled, "This event has already been cancelled.");
		require(owners.length == quantity.length, "`owners` and `quantity` parameters must be of equal length.");

		for (uint i = 0; i < quantity.length; i++) {
			totalTransferAmount +=  e.price * quantity[i];
		}

		require(getBalance() >= totalTransferAmount, "Insufficient ETH in contract to refund owners.");

		e.cancelled = true;

		// Refund token owners
		for (uint i = 0; i < owners.length; i++) {
			payable(owners[i]).transfer(e.price * quantity[i]);
		}
	}

	function getBalance() public view onlyOwner returns(uint) {
		return address(this).balance;
	}

	function transferBalance(address payable addr) external onlyOwner {
		addr.transfer(getBalance());
	}
}
