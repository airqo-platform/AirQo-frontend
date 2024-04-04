import Layout from 'src/layout/Layout'
import { Outlet } from 'react-router-dom'

const Index = () => {
  return (
    <Layout pageTitle="Report Generator">
      <Outlet />
    </Layout>
  )
}

export default Index
