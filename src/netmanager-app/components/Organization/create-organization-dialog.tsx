"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Loader2, Check, Building2, Globe, Briefcase, Clock, FileText, LinkIcon, ImageIcon } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import TimezoneSelect, { allTimezones } from "react-timezone-select"
import countryList from "react-select-country-list"
import { Textarea } from "@/components/ui/textarea"
import { useCreateGroup } from "@/core/hooks/useGroups"
import { useRouter } from "next/navigation"

// Schema
const createOrgSchema = z.object({
  grp_title: z.string().min(2, { message: "Organization name must be at least 2 characters." }),
  grp_country: z.string({ required_error: "Please select a country." }),
  grp_industry: z.string({ required_error: "Please select an industry." }),
  grp_timezone: z.object({ value: z.string(), label: z.string() }, { required_error: "Please select a timezone." }),
  grp_description: z.string().min(1, { message: "Description is required." }),
  grp_website: z.string().url({ message: "Please enter a valid URL." }).min(1, { message: "Website is required." }),
  grp_profile_picture: z
    .string()
    .url({ message: "Please enter a valid URL for the profile picture." })
    .optional()
    .or(z.literal("")),
})

const industries = [
  { value: "Manufacturing", label: "Manufacturing" },
  { value: "Information Technology", label: "Information Technology" },
  { value: "Healthcare", label: "Healthcare" },
  { value: "Finance", label: "Finance" },
  { value: "Education", label: "Education" },
  { value: "Retail", label: "Retail" },
  { value: "Other", label: "Other" },
]

export function CreateOrganizationDialog() {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const countries = countryList().getData()

  // Form
  const form = useForm<z.infer<typeof createOrgSchema>>({
    resolver: zodResolver(createOrgSchema),
    defaultValues: {
      grp_title: "",
      grp_country: "",
      grp_industry: "",
      grp_timezone: { value: "", label: "" },
      grp_description: "",
      grp_website: "",
      grp_profile_picture: "",
    },
  })

  // API Hook
  const { mutateAsync: createGroup, status } = useCreateGroup()
  const isCreatingGroup = status === "pending"

  // Form submission handler
  const onCreateOrganization = async (data: z.infer<typeof createOrgSchema>) => {
    try {
      const result = await createGroup(data as any )

      toast({
        title: "Organization created",
        description: `Successfully created organization: ${data.grp_title}. Please complete the setup by assigning sites, devices, and inviting team members.`,
      })

      setOpen(false)
      form.reset()

      // Optionally navigate to the new organization's page
      if (result && result._id) {
        router.push(`/organizations/${result._id}`)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to create organization: ${(error as Error).message}`,
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Create Organization
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center">
            <Building2 className="mr-2 h-6 w-6" /> Create New Organization
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onCreateOrganization)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="grp_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" /> Organization Name
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter organization name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="grp_country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Globe className="h-4 w-4" /> Country
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[200px]">
                          {countries.map((country) => (
                            <SelectItem key={country.value} value={country.value}>
                              {country.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="grp_industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" /> Industry
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {industries.map((industry) => (
                            <SelectItem key={industry.value} value={industry.value}>
                              {industry.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="grp_timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Clock className="h-4 w-4" /> Timezone
                      </FormLabel>
                      <FormControl>
                        <TimezoneSelect
                          value={field.value}
                          onChange={field.onChange}
                          timezones={{
                            ...allTimezones,
                            "America/Lima": "Lima",
                            "Europe/London": "London",
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="grp_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <FileText className="h-4 w-4" /> Description
                    </FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter organization description" className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="grp_website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4" /> Website
                      </FormLabel>
                      <FormControl>
                        <Input type="url" placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="grp_profile_picture"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" /> Profile Picture URL
                      </FormLabel>
                      <FormControl>
                        <Input type="url" placeholder="https://example.com/image.jpg" {...field} />
                      </FormControl>
                      <FormDescription>Enter a URL for the organization&#39;s profile picture (optional)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isCreatingGroup}>
                  {isCreatingGroup ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  Create Organization
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

