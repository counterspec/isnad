export default function ContractsPage() {
  return (
    <article>
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 tracking-tight">Smart Contracts</h1>
      <p className="text-lg text-[var(--text-secondary)] mb-8">
        On-chain architecture and deployed contract addresses.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-[var(--border-dim)]">
        Contract Addresses (Base Sepolia)
      </h2>
      <div className="card overflow-x-auto p-0 mb-8">
        <table className="w-full text-sm min-w-[500px]">
          <thead className="border-b-2 border-black">
            <tr>
              <th className="text-left p-3 font-bold">Contract</th>
              <th className="text-left p-3 font-bold">Address</th>
            </tr>
          </thead>
          <tbody>
            <ContractRow name="ISNADToken" address="0xc41c1006A1AaC093C758A2f09de16fee2561651A" />
            <ContractRow name="ISNADRegistry" address="0x5A06453257874Fd000738F28C462d17BFf8e1EA3" />
            <ContractRow name="ISNADStaking" address="0x58983D142A388A96B7d9F970005483AA044CCAD9" />
            <ContractRow name="ISNADOracle" address="0x418EbF8F206fA6efF3318647d8c4Ac137dDf3aC7" />
            <ContractRow name="ISNADRewardPool" address="0x474cB2441C0Af053DAe052302a6829a218Aa656F" />
            <ContractRow name="TimelockController" address="0x2c99dB618a6dBFf0F0e74f7949fcC9A23ffB4A69" />
            <ContractRow name="ISNADGovernor" address="0xf08269e04029eB0eeAfcE10Ed3aa9Fb2bAbB61Cd" last />
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-[var(--border-dim)]">
        Architecture Overview
      </h2>
      <div className="card font-mono text-xs mb-8 overflow-x-auto">
        <pre>{`┌─────────────────────────────────────────────────────────────┐
│                      ISNAD Protocol                         │
├──────────────┬──────────────┬──────────────┬───────────────┤
│  ISNADToken  │ ISNADRegistry│ ISNADStaking │  ISNADOracle  │
│  (ERC20 +    │  (inscribe   │  (stake +    │  (flag +      │
│   votes)     │   + metadata)│   attest)    │   jury)       │
├──────────────┴──────────────┴──────────────┴───────────────┤
│  ISNADRewardPool        │        ISNADGovernor             │
│  (yield distribution)   │        (DAO + timelock)          │
└─────────────────────────┴──────────────────────────────────┘`}</pre>
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-[var(--border-dim)]">
        Contract Descriptions
      </h2>
      
      <h3 className="text-lg font-bold mt-6 mb-2">ISNADToken</h3>
      <p className="text-[var(--text-secondary)] mb-4">
        ERC20 token with ERC20Votes extension for governance. Fixed max supply of 1B tokens.
        Includes MINTER_ROLE (reward pool) and BURNER_ROLE (staking contract for slashing).
      </p>

      <h3 className="text-lg font-bold mt-6 mb-2">ISNADRegistry</h3>
      <p className="text-[var(--text-secondary)] mb-4">
        Stores resource inscriptions. Resources are identified by SHA-256 content hash.
        Supports single inscriptions and chunked uploads for large files.
      </p>

      <h3 className="text-lg font-bold mt-6 mb-2">ISNADStaking</h3>
      <p className="text-[var(--text-secondary)] mb-4">
        Manages attestations. Auditors stake tokens with lock durations (30-90 days).
        Calculates trust scores with lock multipliers. Handles slashing on Oracle verdict.
      </p>

      <h3 className="text-lg font-bold mt-6 mb-2">ISNADOracle</h3>
      <p className="text-[var(--text-secondary)] mb-4">
        Detection and jury system. Handles flags, jury selection, voting, and verdicts.
        Supermajority (67%) required. Appeals supported with 2x deposit.
      </p>

      <h3 className="text-lg font-bold mt-6 mb-2">ISNADRewardPool</h3>
      <p className="text-[var(--text-secondary)] mb-4">
        Distributes yield to auditors based on stake amount and lock duration.
        Lock multipliers: 30d=1x, 60d=1.25x, 90d=1.5x, 180d=2x, 365d=3x.
      </p>

      <h3 className="text-lg font-bold mt-6 mb-2">ISNADGovernor + Timelock</h3>
      <p className="text-[var(--text-secondary)] mb-4">
        OpenZeppelin Governor with 2-day timelock. 4% quorum, 100k $ISNAD proposal threshold.
        Controls protocol parameters and upgrades.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-[var(--border-dim)]">
        Source Code
      </h2>
      <p className="text-[var(--text-secondary)]">
        All contracts are open source and verified on BaseScan:
        <br />
        <a href="https://github.com/counterspec/isnad/tree/main/contracts" className="underline">
          github.com/counterspec/isnad/contracts
        </a>
      </p>
    </article>
  );
}

function ContractRow({ name, address, last }: { name: string; address: string; last?: boolean }) {
  return (
    <tr className={last ? '' : 'border-b border-[var(--border-dim)]'}>
      <td className="p-3 font-semibold">{name}</td>
      <td className="p-3 font-mono text-xs">
        <a 
          href={`https://sepolia.basescan.org/address/${address}`} 
          target="_blank"
          className="underline"
        >
          {address}
        </a>
      </td>
    </tr>
  );
}
