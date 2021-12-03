import { TonClient } from "@tonclient/core";
import { libNode } from "@tonclient/lib-node";

export const NETWORK_MAP = {
  LOCAL: "http://localhost",
  DEVNET: "https://net.ton.dev",
  MAINNET: "https://main.ton.dev",
};

export const createClient = (url = null) => {
  TonClient.useBinaryLibrary(libNode);
  return new TonClient({
    network: {
      server_address:
        url || NETWORK_MAP[process.env.NETWORK] || "https://net.ton.dev",
    },
  });
};
