// Minimal next/navigation for rendering client components outside Next.js
const router = {
  push: () => {},
  replace: () => {},
  back: () => {},
  prefetch: () => Promise.resolve(),
  refresh: () => {},
}

export const useRouter = () => router
export const usePathname = () => "/"
export const useParams = () => ({})
export const useSearchParams = () => new URLSearchParams()
export const redirect = () => {}
export const notFound = () => {}
