"use client"

import { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Loader2 } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import * as z from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import TimezoneSelect, { allTimezones } from "react-timezone-select"
import countryList from "react-select-country-list"
import { useMutation } from "@tanstack/react-query"
import { useDispatch } from "react-redux"
import { sites } from "@/core/apis/sites"
import { setError } from "@/core/redux/slices/sitesSlice"
import { useAppSelector } from "@/core/redux/hooks"
import { useSites } from "@/core/hooks/useSites"

// Step 1: Create Organization
const createOrgSchema = z.object({
  grp_title: z.string().min(2, { message: "Organization name must be at least 2 characters." }),
  grp_country: z.string({ required_error: "Please select a country." }),
  grp_industry: z.string({ required_error: "Please select an industry." }),
  grp_timezone: z.object({ value: z.string(), label: z.string() }, { required_error: "Please select a timezone." }),
  grp_website: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal("")),
  grp_profile_picture: z
    .string()
    .url({ message: "Please enter a valid URL for the profile picture." })
    .optional()
    .or(z.literal("")),
})

// Step 2: Add Sites
const addSitesSchema = z.object({
  sites: z
    .array(
      z.object({
        name: z.string().min(2, { message: "Site name must be at least 2 characters." }),
        address: z.string().min(5, { message: "Address must be at least 5 characters." }),
      }),
    )
    .min(1, { message: "Add at least one site." }),
})

// Step 3: Add Devices
const addDevicesSchema = z.object({
  devices: z
    .array(
      z.object({
        name: z.string().min(2, { message: "Device name must be at least 2 characters." }),
        type: z.string({ required_error: "Please select a device type." }),
      }),
    )
    .min(1, { message: "Add at least one device." }),
})

// Step 4: Invite Members
const inviteMembersSchema = z.object({
  members: z
    .array(
      z.object({
        email: z.string().email({ message: "Please enter a valid email address." }),
        role: z.string({ required_error: "Please select a role." }),
      }),
    )
    .min(1, { message: "Invite at least one member." }),
})

const industries = [
  { value: "Manufacturing", label: "Manufacturing" },
  { value: "Information Technology", label: "Information Technology" },
  { value: "healthcare", label: "Healthcare" },
  { value: "finance", label: "Finance" },
  { value: "education", label: "Education" },
  { value: "retail", label: "Retail" },
  { value: "other", label: "Other" },
]

const deviceTypes = [
  { value: "sensor", label: "Sensor" },
  { value: "camera", label: "Camera" },
  { value: "controller", label: "Controller" },
  { value: "other", label: "Other" },
]

const roles = [
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "member", label: "Member" },
]

export function CreateOrganizationDialog() {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const dispatch = useDispatch()
  const activeNetwork = useAppSelector((state) => state.user.activeNetwork)
  const activeGroup = useAppSelector((state) => state.user.activeGroup)

  const countries = useMemo(() => countryList().getData(), [])

  const createOrgForm = useForm<z.infer<typeof createOrgSchema>>({
    resolver: zodResolver(createOrgSchema),
    defaultValues: {
      grp_title: "",
      grp_country: "",
      grp_industry: "",
      grp_timezone: { value: "", label: "" },
      grp_website: "",
      grp_profile_picture: "",
    },
  })

  const addSitesForm = useForm<z.infer<typeof addSitesSchema>>({
    resolver: zodResolver(addSitesSchema),
    defaultValues: {
      sites: [{ name: "", address: "" }],
    },
  })

  const addDevicesForm = useForm<z.infer<typeof addDevicesSchema>>({
    resolver: zodResolver(addDevicesSchema),
    defaultValues: {
      devices: [{ name: "", type: "" }],
    },
  })

  const inviteMembersForm = useForm<z.infer<typeof inviteMembersSchema>>({
    resolver: zodResolver(inviteMembersSchema),
    defaultValues: {
      members: [{ email: "", role: "" }],
    },
  })

  const { sites: groupsData, isLoading: isLoadingGroups, error: groupsError } = useSites()

  const createSiteMutation = useMutation({
    mutationFn: (siteData: any) => sites.createSite(siteData),
    onSuccess: () => {
      toast({
        title: "Site created",
        description: "The site has been successfully created.",
      })
    },
    onError: (error: Error) => {
      dispatch(setError(error.message))
      toast({
        title: "Error",
        description: "Failed to create site. Please try again.",
        variant: "destructive",
      })
    },
  })

  const onSubmit = async (data: any) => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    } else {
      setIsSubmitting(true)
      // Combine data from all steps
      const finalData = {
        ...createOrgForm.getValues(),
        ...addSitesForm.getValues(),
        ...addDevicesForm.getValues(),
        ...data,
      }
      try {
        // Create the organization
        const createdOrg = await createOrganization(finalData) // Placeholder - replace with your actual API call
        const newGroupId = createdOrg.id // Assuming the API returns the new group ID

        // Create sites with the new group ID
        for (const site of finalData.sites) {
          await createSiteMutation.mutateAsync({
            name: site.name,
            address: site.address,
            groups: [newGroupId], 
            network: activeNetwork?.net_name,
          })
        }

        toast({
          title: "Organization created",
          description: "The organization has been successfully created.",
        })
        setOpen(false)
        resetForms()
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create organization. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const resetForms = () => {
    createOrgForm.reset()
    addSitesForm.reset()
    addDevicesForm.reset()
    inviteMembersForm.reset()
    setCurrentStep(1)
  }

  const renderStep = () => {
    if (isLoadingGroups) {
      return <div>Loading groups...</div>
    }

    if (groupsError) {
      return <div>Error loading groups: {groupsError.message}</div>
    }

    switch (currentStep) {
      case 1:
        return (
          <Form {...createOrgForm}>
            <form onSubmit={createOrgForm.handleSubmit(() => setCurrentStep(2))} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createOrgForm.control}
                  name="grp_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter organization name" {...field} className="w-full" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createOrgForm.control}
                  name="grp_country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
              </div>
              <FormField
                control={createOrgForm.control}
                name="grp_industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
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
                control={createOrgForm.control}
                name="grp_timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timezone</FormLabel>
                    <FormControl>
                      <Controller
                        name="grp_timezone"
                        control={createOrgForm.control}
                        render={({ field }) => (
                          <TimezoneSelect
                            value={field.value}
                            onChange={field.onChange}
                            timezones={{
                              ...allTimezones,
                              "America/Lima": "Lima",
                              "Europe/London": "London",
                            }}
                            className="w-full"
                          />
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createOrgForm.control}
                name="grp_website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://example.com" {...field} className="w-full" />
                    </FormControl>
                    <FormDescription>Enter the organization's website URL (optional)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createOrgForm.control}
                name="grp_profile_picture"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Picture URL</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://example.com/image.jpg" {...field} className="w-full" />
                    </FormControl>
                    <FormDescription>Enter a URL for the organization's profile picture (optional)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" className="w-full">
                  Next
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )
      case 2:
        return (
          <Form {...addSitesForm}>
            <form onSubmit={addSitesForm.handleSubmit(() => setCurrentStep(3))} className="space-y-6">
              {addSitesForm.getValues().sites.map((_, index) => (
                <div key={index} className="space-y-4 p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold">Site {index + 1}</h3>
                  <FormField
                    control={addSitesForm.control}
                    name={`sites.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Site Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter site name" {...field} className="w-full" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addSitesForm.control}
                    name={`sites.${index}.address`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Site Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter site address" {...field} className="w-full" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const currentSites = addSitesForm.getValues().sites
                  addSitesForm.setValue("sites", [...currentSites, { name: "", address: "" }])
                }}
                className="w-full"
              >
                Add Another Site
              </Button>
              <DialogFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                  Back
                </Button>
                <Button type="submit">Next</Button>
              </DialogFooter>
            </form>
          </Form>
        )
      case 3:
        return (
          <Form {...addDevicesForm}>
            <form onSubmit={addDevicesForm.handleSubmit(() => setCurrentStep(4))} className="space-y-6">
              {addDevicesForm.fields.devices.map((field, index) => (
                <div key={field.id} className="space-y-4 p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold">Device {index + 1}</h3>
                  <FormField
                    control={addDevicesForm.control}
                    name={`devices.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Device Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter device name" {...field} className="w-full" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addDevicesForm.control}
                    name={`devices.${index}.type`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Device Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select device type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {deviceTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addDevicesForm.append({ name: "", type: "" })}
                className="w-full"
              >
                Add Another Device
              </Button>
              <DialogFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>
                  Back
                </Button>
                <Button type="submit">Next</Button>
              </DialogFooter>
            </form>
          </Form>
        )
      case 4:
        return (
          <Form {...inviteMembersForm}>
            <form onSubmit={inviteMembersForm.handleSubmit(onSubmit)} className="space-y-6">
              {inviteMembersForm.fields.members.map((field, index) => (
                <div key={field.id} className="space-y-4 p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold">Member {index + 1}</h3>
                  <FormField
                    control={inviteMembersForm.control}
                    name={`members.${index}.email`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter email address" {...field} className="w-full" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={inviteMembersForm.control}
                    name={`members.${index}.role`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role.value} value={role.value}>
                                {role.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => inviteMembersForm.append({ email: "", role: "" })}
                className="w-full"
              >
                Invite Another Member
              </Button>
              <DialogFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(3)}>
                  Back
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Organization
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Organization
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create New Organization</DialogTitle>
          <p className="text-muted-foreground">Step {currentStep} of 4</p>
        </DialogHeader>
        <div className="mt-4">{renderStep()}</div>
      </DialogContent>
    </Dialog>
  )
}

// Placeholder function - replace with your actual API call
const createOrganization = async (data: any) => {
  // Your API call to create the organization here
  // ...
  return { id: 123 } // Replace with the actual ID returned by your API
}

