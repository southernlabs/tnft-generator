export default {
  abi: {
	"ABI version": 2,
	"header": ["pubkey", "time", "expire"],
	"functions": [
		{
			"name": "constructor",
			"inputs": [
				{"name":"addrOwner","type":"address"},
				{"name":"codeIndex","type":"cell"},
				{"name":"_name","type":"bytes"},
				{"name":"_url","type":"bytes"},
				{"name":"_editionNumber","type":"uint8"},
				{"name":"_editionAmount","type":"uint8"},
				{"name":"_managersList","type":"address[]"},
				{"name":"_royalty","type":"uint8"}
			],
			"outputs": [
			]
		},
		{
			"name": "transferOwnership",
			"inputs": [
				{"name":"addrTo","type":"address"}
			],
			"outputs": [
			]
		},
		{
			"name": "getInfo",
			"inputs": [
			],
			"outputs": [
				{"name":"addrRoot","type":"address"},
				{"name":"addrOwner","type":"address"},
				{"name":"addrAuthor","type":"address"},
				{"name":"addrData","type":"address"},
				{"name":"id","type":"uint256"},
				{"name":"name","type":"bytes"},
				{"name":"url","type":"bytes"},
				{"name":"number","type":"uint8"},
				{"name":"amount","type":"uint8"}
			]
		},
		{
			"name": "getOwner",
			"inputs": [
			],
			"outputs": [
				{"name":"addrOwner","type":"address"}
			]
		},
		{
			"name": "lendOwnership",
			"inputs": [
				{"name":"_addr","type":"address"}
			],
			"outputs": [
			]
		},
		{
			"name": "returnOwnership",
			"inputs": [
			],
			"outputs": [
			]
		},
		{
			"name": "getAllowance",
			"inputs": [
			],
			"outputs": [
				{"name":"addr","type":"address"}
			]
		},
		{
			"name": "burn",
			"inputs": [
				{"name":"_dest","type":"address"}
			],
			"outputs": [
			]
		},
		{
			"name": "addManager",
			"inputs": [
				{"name":"_addr","type":"address"}
			],
			"outputs": [
			]
		},
		{
			"name": "removeManager",
			"inputs": [
				{"name":"_addr","type":"address"}
			],
			"outputs": [
			]
		},
		{
			"name": "getManagersList",
			"inputs": [
			],
			"outputs": [
				{"name":"managers","type":"address[]"}
			]
		},
		{
			"name": "resolveCodeHashIndex",
			"inputs": [
				{"name":"addrRoot","type":"address"},
				{"name":"addrOwner","type":"address"}
			],
			"outputs": [
				{"name":"codeHashIndex","type":"uint256"}
			]
		},
		{
			"name": "resolveIndex",
			"inputs": [
				{"name":"addrRoot","type":"address"},
				{"name":"addrData","type":"address"},
				{"name":"addrOwner","type":"address"}
			],
			"outputs": [
				{"name":"addrIndex","type":"address"}
			]
		},
		{
			"name": "royalty",
			"inputs": [
			],
			"outputs": [
				{"name":"royalty","type":"uint8"}
			]
		}
	],
	"data": [
		{"key":1,"name":"_id","type":"uint256"}
	],
	"events": [
	]
},
  image:
    "",
};
