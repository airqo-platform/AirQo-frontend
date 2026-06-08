/**
 * Detects if the current user agent is running on Apple Silicon (ARM64).
 * Returns 'arm64' for Apple Silicon, 'x64' for Intel, and 'unknown' otherwise.
 */
export async function getMacArchitecture(): Promise<'arm64' | 'x64' | 'unknown'> {
  if (typeof window === 'undefined') return 'unknown';

  // Primary method: User-Agent Client Hints API (Chromium-based: Chrome, Edge)
  // @ts-ignore
  if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
    try {
      // @ts-ignore
      const values = await navigator.userAgentData.getHighEntropyValues(['architecture']);
      if (values.architecture === 'arm') return 'arm64';
      if (values.architecture === 'x86') return 'x64';
    } catch (e) {
      // Fallback to other checks
    }
  }

  // Fallback 1: Check for 'Apple' in the WebGL renderer (Safari/Legacy Chrome)
  // Apple Silicon Macs will typically show 'Apple M1' or similar in the renderer string.
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        if (renderer.toLowerCase().includes('apple')) return 'arm64';
      }
    }
  } catch (e) {
    // Ignore and proceed
  }

  // Fallback 2: Check hardwareConcurrency (Apple Silicon Macs have >= 8 cores)
  // This is a heuristic and can be inaccurate, so it's the last resort.
  if (navigator.hardwareConcurrency >= 8) {
    // We can't be sure, but it raises the probability of Apple Silicon on a modern Mac.
    // However, older Intel Macs also have 8+ cores, so we'll just return unknown if not sure.
  }

  return 'unknown';
}
