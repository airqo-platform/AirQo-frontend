/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'src/services/redux/utils'
import { BlobProvider } from '@react-pdf/renderer'
// templates
import AirQoPdfDocument from './templates/AirQo'
import FrenchEmPdfDocument from './templates/FrenchEm'
import { PulseLoader } from 'react-spinners'
import SaveIcon from 'src/assets/icons/SaveIcon'
import { Button as ButtonComp } from 'src/components/buttons'
import { Breadcrumb, BreadcrumbItem } from 'flowbite-react'
import { toast } from 'react-toastify'
import DocIcon from 'src/assets/icons/DocIcon'
import PdfIcon from 'src/assets/icons/PdfIcon'
import { RefreshIcon } from 'src/assets/icons/RefreshIcon'
import Reports from 'src/assets/icons/Reports'
// import { saveAs } from 'file-saver'

const ReportView = () => {
  const navigate = useNavigate()
  const reportData = useSelector((state) => state.report.reportData)
  const reportTitle = useSelector((state) => state.report.reportTitle)
  const reportTemplate = useSelector((state) => state.report.reportTemplate)

  const getTemplate = () => {
    switch (reportTemplate) {
      case 'AirQo':
        return <AirQoPdfDocument data={reportData} />
      case 'French_Embassy':
        return <FrenchEmPdfDocument data={reportData} />
      default:
        return <AirQoPdfDocument data={reportData} />
    }
  }

  const handleFileSave = (blob: Blob, fileName: string) => {
    const reader = new FileReader()
    reader.onloadend = function () {
      // Convert blob to Base64
      const base64data = reader.result as string
      // Check the size of the base64 string (roughly 3/4 the original blob size)
      if (base64data.length > 3 * 1024 * 1024) {
        // Change this to the maximum size you want to allow
        toast.error('File is too large to save')
        return
      }
      // Retrieve existing files from localStorage
      const savedFiles = JSON.parse(localStorage.getItem('savedFiles') || '[]')
      // Check if file with same name already exists
      const existingFile = savedFiles.find(
        (file: { fileName: string }) => file.fileName === fileName,
      )
      if (existingFile) {
        toast.error('File with the same name already exists')
        return
      }
      // Add new file to array along with the current date
      savedFiles.push({
        fileName,
        data: base64data, // Store the whole base64 string including MIME type
        date: new Date().toISOString(),
      })
      // Save updated array to localStorage
      localStorage.setItem('savedFiles', JSON.stringify(savedFiles))
      // Set a timestamp for when the data was stored
      localStorage.setItem('timestamp', Date.now().toString())
      toast.success('File saved successfully')
    }
    reader.onerror = function () {
      toast.error('An error occurred while reading the file')
    }
    reader.readAsDataURL(blob)
  }

  return (
    <div className="mt-4 space-y-4">
      <Breadcrumb
        aria-label="Solid background breadcrumb example"
        className="bg-blue-200 rounded-md px-5 py-3 dark:bg-gray-800 dark:text-white dark:bg-blue-800"
      >
        <BreadcrumbItem href="#" onClick={() => navigate('/')}>
          <div className="mr-2">
            <Reports width={20} height={20} />
          </div>
          Report Generator
        </BreadcrumbItem>
        <BreadcrumbItem href="#">Report</BreadcrumbItem>
      </Breadcrumb>

      {/* show report title */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold dark:text-white">{reportTitle}</h1>
      </div>

      {/* show report */}
      <BlobProvider document={getTemplate()}>
        {({ url, blob, error }) => {
          if (error) {
            return (
              <div className="text-red-500 dark:text-red-400 absolute top-0 left-0 z-50 w-full h-full flex flex-col items-center justify-center gap-2">
                <p>An error occurred while generating the report</p>
                <ButtonComp
                  backgroundColor="#006583"
                  text={null}
                  onClick={() => navigate('/')}
                  icon={<RefreshIcon width={20} height={20} />}
                />
              </div>
            )
          }

          if (!url) {
            return (
              <div className="absolute top-0 left-0 z-50 w-full h-full flex flex-col items-center justify-center">
                <PulseLoader color="#006583" speedMultiplier={1} />
                <p className="mt-4 text-center">
                  Generating report, please wait...
                </p>
              </div>
            )
          }

          const handleSaveAsDoc = () => {}

          return (
            <div className="flex flex-col gap-3">
              <div className="flex gap-2 justify-end flex-wrap">
                <ButtonComp
                  backgroundColor="#006583"
                  text="Save"
                  icon={<SaveIcon width={20} height={20} />}
                  onClick={() => {
                    if (blob !== null) {
                      handleFileSave(blob, `${reportTitle}.pdf`)
                    } else {
                      console.error('Blob is null')
                    }
                  }}
                />
                <ButtonComp
                  text="Download Doc"
                  backgroundColor="#145dff"
                  icon={<DocIcon width={24} height={24} />}
                  onClick={handleSaveAsDoc}
                  disabled
                />
                <ButtonComp
                  backgroundColor="#800000"
                  text="Download PDF"
                  icon={<PdfIcon width={20} height={20} fill="#fff" />}
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = url as string
                    link.download = `${reportTitle}.pdf`
                    link.click()
                  }}
                />
              </div>

              <iframe
                src={url || ''}
                title="report"
                width="100%"
                height="600px"
              />
            </div>
          )
        }}
      </BlobProvider>
    </div>
  )
}

export default ReportView
