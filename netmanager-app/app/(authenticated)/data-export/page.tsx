'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ExportForm from '@/components/export-data/ExportForm'
import { ExportType } from '@/app/types/export'

export default function ExportData() {
  const [activeTab, setActiveTab] = useState<ExportType>('sites')

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Export Data</h1>
      <p className="mb-4 text-center text-gray-600">
        Customize the data you want to download. We recommend downloading data for shorter time
        periods like a week or a month to avoid timeouts.
      </p>
      <Card>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ExportType)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sites">Sites</TabsTrigger>
            <TabsTrigger value="devices">Devices</TabsTrigger>
            <TabsTrigger value="airqlouds">AirQlouds</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab}>
            <ExportForm exportType={activeTab} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}

