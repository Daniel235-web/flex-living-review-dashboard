import { http, createConfig } from "wagmi";
import { polkadotHubTestnet } from "./chains";
import { injected, walletConnect } from "wagmi/connectors";

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || "demo";

export const config = createConfig({
  chains: [polkadotHubTestnet],
  connectors: [injected(), ...(projectId !== "demo" ? [walletConnect({ projectId })] : [])],
  transports: {
    [polkadotHubTestnet.id]: http(),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
