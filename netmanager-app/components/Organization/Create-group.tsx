"use client"

import { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Loader2 } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import * as z from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import TimezoneSelect, { allTimezones } from "react-timezone-select"
import countryList from "react-select-country-list"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useDispatch } from "react-redux"
import { sites } from "@/core/apis/sites"
import { setError } from "@/core/redux/slices/sitesSlice"
// import { useAppSelector } from "@/core/redux/hooks"
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
        _id: z.string(),
        name: z.string(),
        groups: z.array(z.string()),
      }),
    )
    .min(1, { message: "Select at least one site." }),
})

// Step 3: Add Devices
const addDevicesSchema = z.object({
  devices: z
    .array(
      z.object({
        _id: z.string(),
        name: z.string(),
        groups: z.array(z.string()),
      }),
    )
    .min(1, { message: "Select at least one device." }),
})

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

// const deviceTypes = [
//   { value: "sensor", label: "Sensor" },
//   { value: "camera", label: "Camera" },
//   { value: "controller", label: "Controller" },
//   { value: "other", label: "Other" },
// ]

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
  // const activeNetwork = useAppSelector((state) => state.user.activeNetwork)
  // const activeGroup = useAppSelector((state) => state.user.activeGroup)

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
      sites: [],
    },
  })

  const addDevicesForm = useForm<z.infer<typeof addDevicesSchema>>({
    resolver: zodResolver(addDevicesSchema),
    defaultValues: {
      devices: [],
    },
  })

  const inviteMembersForm = useForm<z.infer<typeof inviteMembersSchema>>({
    resolver: zodResolver(inviteMembersSchema),
    defaultValues: {
      members: [{ email: "", role: "" }],
    },
  })

  const { sites: groupsData, isLoading: isLoadingGroups, error: groupsError } = useSites()
  const { data: allSites, isLoading: isLoadingSites } = useQuery(["sites"], () => sites.getAllSites())
  const { data: allDevices, isLoading: isLoadingDevices } = useQuery(["devices"], () => sites.getAllDevices())

  const updateSitesMutation = useMutation({
    mutationFn: (updateData: { siteIds: string[]; updateData: { groups: string[] } }) => sites.updateSites(updateData),
    onSuccess: () => {
      toast({
        title: "Sites updated",
        description: "The sites have been successfully updated.",
      })
    },
    onError: (error: Error) => {
      dispatch(setError(error.message))
      toast({
        title: "Error",
        description: "Failed to update sites. Please try again.",
        variant: "destructive",
      })
    },
  })

  const updateDevicesMutation = useMutation({
    mutationFn: (updateData: { deviceIds: string[]; updateData: { groups: string[] } }) =>
      sites.updateDevices(updateData),
    onSuccess: () => {
      toast({
        title: "Devices updated",
        description: "The devices have been successfully updated.",
      })
    },
    onError: (error: Error) => {
      dispatch(setError(error.message))
      toast({
        title: "Error",
        description: "Failed to update devices. Please try again.",
        variant: "destructive",
      })
    },
  })

  const onSubmit = async (data: any) => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    } else {
      setIsSubmitting(true)
      const finalData = {
        ...createOrgForm.getValues(),
        ...addSitesForm.getValues(),
        ...addDevicesForm.getValues(),
        ...data,
      }
      try {
        const createdOrg = await createOrganization(finalData)
        const newGroupId = createdOrg.id

        const sitesToUpdate = finalData.sites.map((site) => ({
          ...site,
          groups: [...site.groups, newGroupId],
        }))
        await updateSitesMutation.mutateAsync({
          siteIds: sitesToUpdate.map((site) => site._id),
          updateData: { groups: sitesToUpdate[0].groups },
        })

        const devicesToUpdate = finalData.devices.map((device) => ({
          ...device,
          groups: [...device.groups, newGroupId],
        }))
        await updateDevicesMutation.mutateAsync({
          deviceIds: devicesToUpdate.map((device) => device._id),
          updateData: { groups: devicesToUpdate[0].groups },
        })

        toast({
          title: "Organization created",
          description: "The organization has been successfully created and sites/devices updated.",
        })
        setOpen(false)
        resetForms()
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create organization or update sites/devices. Please try again.",
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
    if (isLoadingGroups || isLoadingSites || isLoadingDevices) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      )
    }

    if (groupsError) {
      return <div>Error loading data: {groupsError.message}</div>
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
              <div className="space-y-4">
                {allSites.map((site) => (
                  <div key={site._id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`site-${site._id}`}
                      checked={addSitesForm.getValues().sites.some((s) => s._id === site._id)}
                      onCheckedChange={(checked) => {
                        const currentSites = addSitesForm.getValues().sites
                        if (checked) {
                          addSitesForm.setValue("sites", [
                            ...currentSites,
                            { _id: site._id, name: site.name, groups: [] },
                          ])
                        } else {
                          addSitesForm.setValue(
                            "sites",
                            currentSites.filter((s) => s._id !== site._id),
                          )
                        }
                      }}
                    />
                    <label
                      htmlFor={`site-${site._id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {site.name}
                    </label>
                  </div>
                ))}
              </div>
              <FormField
                control={addSitesForm.control}
                name="sites"
                render={() => (
                  <FormItem>
                    <FormLabel>Selected Sites</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        {addSitesForm.getValues().sites.map((site) => (
                          <div key={site._id} className="flex items-center justify-between">
                            <span>{site.name}</span>
                            <div>
                              {site.groups.map((groupId) => {
                                const group = groupsData.find((g) => g._id === groupId)
                                return group ? (
                                  <span
                                    key={groupId}
                                    className="inline-block bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs mr-1"
                                  >
                                    {group.name}
                                  </span>
                                ) : null
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <div className="space-y-4">
                {allDevices.map((device) => (
                  <div key={device._id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`device-${device._id}`}
                      checked={addDevicesForm.getValues().devices.some((d) => d._id === device._id)}
                      onCheckedChange={(checked) => {
                        const currentDevices = addDevicesForm.getValues().devices
                        if (checked) {
                          addDevicesForm.setValue("devices", [
                            ...currentDevices,
                            { _id: device._id, name: device.name, groups: [] },
                          ])
                        } else {
                          addDevicesForm.setValue(
                            "devices",
                            currentDevices.filter((d) => d._id !== device._id),
                          )
                        }
                      }}
                    />
                    <label
                      htmlFor={`device-${device._id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {device.name}
                    </label>
                  </div>
                ))}
              </div>
              <FormField
                control={addDevicesForm.control}
                name="devices"
                render={() => (
                  <FormItem>
                    <FormLabel>Selected Devices</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        {addDevicesForm.getValues().devices.map((device) => (
                          <div key={device._id} className="flex items-center justify-between">
                            <span>{device.name}</span>
                            <div>
                              {device.groups.map((groupId) => {
                                const group = groupsData.find((g) => g._id === groupId)
                                return group ? (
                                  <span
                                    key={groupId}
                                    className="inline-block bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs mr-1"
                                  >
                                    {group.name}
                                  </span>
                                ) : null
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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

