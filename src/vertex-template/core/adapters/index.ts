import { vertexConfig } from "@/vertex.config";
import type { VertexApiAdapter } from "@/core/config/vertex-config";
import type { VertexAdapter } from "./types";

import { mockAdapter } from "./mock";

export function createAdapter(
  adapterName: VertexApiAdapter = vertexConfig.api.adapter,
): VertexAdapter {
  switch (adapterName) {
    case "mock":
      return mockAdapter;

    default: {
      const exhaustiveCheck: never = adapterName;
      throw new Error(`Unsupported Vertex adapter: ${exhaustiveCheck}`);
    }
  }
}

export const adapter = createAdapter();

export type { VertexAdapter } from "./types";
