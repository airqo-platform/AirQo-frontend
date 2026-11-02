// next/dynamic stand-in: the lazily loaded component renders nothing in tests
export default function dynamic() {
  return function DynamicPlaceholder() {
    return null
  }
}
