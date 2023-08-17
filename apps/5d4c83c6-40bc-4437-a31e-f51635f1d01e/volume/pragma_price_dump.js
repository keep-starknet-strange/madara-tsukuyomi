const filter = {
  header: { weak: false },
  events: [
    {
      from_address:
        '0x7c89241907321efade429d50554c9725e8b85db8824275ff8c4421526f05aa',
      keys: [
        '0x0280bb2099800026f90c334a3a23888ffe718a2920ffbbf4f44c6d3d5efb613c',
      ],
    },
  ],
};

function decodeBlock(block) {
  const { header } = block;
  return (block?.events ?? []).map((evt, idx) => decodeEvent(header, evt, idx));
}

// Transform a single event by extracting the relevant data.
function decodeEvent(header, { event, transaction }, eventIdx) {
  const { meta } = transaction;

  return {
    id: `${meta.hash}-${eventIdx}`,
    timestamp: header.timestamp,
    pairId: event.data[3],
    txHash: meta.hash,
    price: parseInt(event.data[4], 16),
  };
}

// Configure indexer for streaming Starknet data starting at the specified block.
export const config = {
  streamUrl: 'http://127.0.0.1:7171',
  startingBlock: 1,
  network: 'starknet',
  filter,
  sinkType: 'postgres',
  sinkOptions: {
    tableName: 'pragma',
  },
};

// Transform each batch of data using the function defined in starknet.js.
export default function transform(batch) {
  return batch.flatMap(decodeBlock);
}
