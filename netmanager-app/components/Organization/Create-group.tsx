"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import {
  Plus,
  Loader2,
  ChevronLeft,
  Check,
  Building2,
  Globe,
  Briefcase,
  Clock,
  Link,
  Image,
  MapPin,
  Users,
} from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import * as z from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import TimezoneSelect, { allTimezones } from "react-timezone-select"
import countryList from "react-select-country-list"
import { useMutation } from "@tanstack/react-query"
import { useDispatch } from "react-redux"
import { sites } from "@/core/apis/sites"
import { setError } from "@/core/redux/slices/sitesSlice"
import { useGroups } from "@/core/hooks/useGroups"
import { useSites } from "@/core/hooks/useSites"
import { useDevices } from "@/core/hooks/useDevices"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

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

const addSitesSchema = z.object({
  sites: z.array(
    z.object({
      _id: z.string(),
      name: z.string(),
      groups: z.array(z.string()),
    }),
  ),
})

const addDevicesSchema = z.object({
  devices: z.array(
    z.object({
      _id: z.string(),
      name: z.string(),
      groups: z.array(z.string()),
    }),
  ),
})

const inviteMembersSchema = z.object({
  members: z.array(
    z.object({
      email: z.string().email({ message: "Please enter a valid email address." }),
    }),
  ),
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
  const [currentStep, setCurrentStep] = useState(1)
  const dispatch = useDispatch()

  const countries = countryList().getData()

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
      members: [{ email: "" }],
    },
  })

  const {
    fields: memberFields,
    append: appendMember,
    remove: removeMember,
  } = useFieldArray({
    control: inviteMembersForm.control,
    name: "members",
  })

  const { groups: groupsData, isLoading: isLoadingGroups, error: groupsError } = useGroups()
  const { sites: allSites, isLoading: isLoadingSites } = useSites()
  const { devices: allDevices, isLoading: isLoadingDevices } = useDevices()

  const createOrganizationMutation = useMutation({
    mutationFn: (data: z.infer<typeof createOrgSchema>) => createOrganization(data),
    onSuccess: (data) => {
      toast({
        title: "Organization created",
        description: `Successfully created organization: ${data.grp_title}`,
      })
      setCurrentStep(2)
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create organization: ${error.message}`,
        variant: "destructive",
      })
    },
  })

  const updateSitesMutation = useMutation({
    mutationFn: (updateData: { siteIds: string[]; updateData: { groups: string[] } }) => sites.updateSites(updateData),
    onSuccess: () => {
      toast({
        title: "Sites updated",
        description: "The sites have been successfully updated with the new organization.",
      })
      setCurrentStep(3)
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
        description: "The devices have been successfully updated with the new organization.",
      })
      setCurrentStep(4)
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

  const inviteMembersMutation = useMutation({
    mutationFn: (data: z.infer<typeof inviteMembersSchema>) => inviteMembers(data),
    onSuccess: () => {
      toast({
        title: "Invitations sent",
        description: "Successfully sent invitations to the new members.",
      })
      setOpen(false)
      resetForms()
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to send invitations: ${error.message}`,
        variant: "destructive",
      })
    },
  })

  const onCreateOrganization = (data: z.infer<typeof createOrgSchema>) => {
    createOrganizationMutation.mutate(data)
  }

  const onAddSites = (data: z.infer<typeof addSitesSchema>) => {
    const newGroupTitle = createOrganizationMutation.data?.grp_title
    if (!newGroupTitle) {
      toast({
        title: "Error",
        description: "Organization not created yet. Please go back and create the organization first.",
        variant: "destructive",
      })
      return
    }

    const sitesToUpdate = data.sites.map((site) => ({
      ...site,
      groups: [...new Set([...site.groups, newGroupTitle])],
    }))

    updateSitesMutation.mutate({
      siteIds: sitesToUpdate.map((site) => site._id),
      updateData: { groups: sitesToUpdate[0].groups },
    })
  }

  const onAddDevices = (data: z.infer<typeof addDevicesSchema>) => {
    const newGroupTitle = createOrganizationMutation.data?.grp_title
    if (!newGroupTitle) {
      toast({
        title: "Error",
        description: "Organization not created yet. Please go back and create the organization first.",
        variant: "destructive",
      })
      return
    }

    const devicesToUpdate = data.devices.map((device) => ({
      ...device,
      groups: [...new Set([...device.groups, newGroupTitle])],
    }))

    updateDevicesMutation.mutate({
      deviceIds: devicesToUpdate.map((device) => device._id),
      updateData: { groups: devicesToUpdate[0].groups },
    })
  }

  const onInviteMembers = (data: z.infer<typeof inviteMembersSchema>) => {
    inviteMembersMutation.mutate(data)
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
        <div className="flex items-center justify-center min-h-[400px]">
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
            <form onSubmit={createOrgForm.handleSubmit(onCreateOrganization)} className="space-y-6">
              <FormField
                control={createOrgForm.control}
                name="grp_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Building2 className="w-4 h-4 inline-block mr-2" />
                      Organization Name
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter organization name" {...field} />
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
                    <FormLabel>
                      <MapPin className="w-4 h-4 inline-block mr-2" />
                      Country
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
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
              <FormField
                control={createOrgForm.control}
                name="grp_industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Briefcase className="w-4 h-4 inline-block mr-2" />
                      Industry
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
                control={createOrgForm.control}
                name="grp_timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Clock className="w-4 h-4 inline-block mr-2" />
                      Timezone
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
              <FormField
                control={createOrgForm.control}
                name="grp_website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Link className="w-4 h-4 inline-block mr-2" />
                      Website
                    </FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormDescription>Enter the organization&apos;s website URL (optional)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createOrgForm.control}
                name="grp_profile_picture"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Image className="w-4 h-4 inline-block mr-2" />
                      Profile Picture URL
                    </FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormDescription>Enter a URL for the organization's profile picture (optional)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={createOrganizationMutation.isLoading}>
                  {createOrganizationMutation.isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  Create Organization
                </Button>
              </div>
            </form>
          </Form>
        )
      case 2:
        return (
          <Form {...addSitesForm}>
            <form onSubmit={addSitesForm.handleSubmit(onAddSites)} className="space-y-6">
              <FormField
                control={addSitesForm.control}
                name="sites"
                render={() => (
                  <FormItem>
                    <FormLabel>
                      <Globe className="w-4 h-4 inline-block mr-2" />
                      Select Sites
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          const site = allSites.find((s) => s._id === value)
                          if (site) {
                            const currentSites = addSitesForm.getValues().sites
                            addSitesForm.setValue("sites", [
                              ...currentSites,
                              { _id: site._id, name: site.name, groups: [] },
                            ])
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a site" />
                        </SelectTrigger>
                        <SelectContent>
                          {allSites.map((site) => (
                            <SelectItem key={site._id} value={site._id}>
                              {site.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {addSitesForm.watch("sites").map((site, index) => (
                <Card key={site._id} className="p-4">
                  <CardContent className="space-y-2">
                    <div className="font-semibold">{site.name}</div>
                    <FormField
                      control={addSitesForm.control}
                      name={`sites.${index}.groups`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Group Titles</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter group titles separated by commas"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value.split(",").map((s) => s.trim()))}
                            />
                          </FormControl>
                          <FormDescription>Enter existing group titles and the new group title</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              ))}
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button type="submit" disabled={updateSitesMutation.isLoading}>
                  {updateSitesMutation.isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  Add Sites
                </Button>
              </div>
            </form>
          </Form>
        )
      case 3:
        return (
          <Form {...addDevicesForm}>
            <form onSubmit={addDevicesForm.handleSubmit(onAddDevices)} className="space-y-6">
              <FormField
                control={addDevicesForm.control}
                name="devices"
                render={() => (
                  <FormItem>
                    <FormLabel>
                      <Globe className="w-4 h-4 inline-block mr-2" />
                      Select Devices
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          const device = allDevices.find((d) => d._id === value)
                          if (device) {
                            const currentDevices = addDevicesForm.getValues().devices
                            addDevicesForm.setValue("devices", [
                              ...currentDevices,
                              { _id: device._id, name: device.name, groups: [] },
                            ])
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a device" />
                        </SelectTrigger>
                        <SelectContent>
                          {allDevices.map((device) => (
                            <SelectItem key={device._id} value={device._id}>
                              {device.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {addDevicesForm.watch("devices").map((device, index) => (
                <Card key={device._id} className="p-4">
                  <CardContent className="space-y-2">
                    <div className="font-semibold">{device.name}</div>
                    <FormField
                      control={addDevicesForm.control}
                      name={`devices.${index}.groups`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Group Titles</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter group titles separated by commas"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value.split(",").map((s) => s.trim()))}
                            />
                          </FormControl>
                          <FormDescription>Enter existing group titles and the new group title</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              ))}
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button type="submit" disabled={updateDevicesMutation.isLoading}>
                  {updateDevicesMutation.isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  Add Devices
                </Button>
              </div>
            </form>
          </Form>
        )
      case 4:
        return (
          <Form {...inviteMembersForm}>
            <form onSubmit={inviteMembersForm.handleSubmit(onInviteMembers)} className="space-y-6">
              {memberFields.map((field, index) => (
                <FormField
                  key={field.id}
                  control={inviteMembersForm.control}
                  name={`members.${index}.email`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Users className="w-4 h-4 inline-block mr-2" />
                        Member Email
                      </FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter member email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              <Button type="button" variant="outline" onClick={() => appendMember({ email: "" })} className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Add Another Member
              </Button>
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(3)}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button type="submit" disabled={inviteMembersMutation.isLoading}>
                  {inviteMembersMutation.isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  Invite Members
                </Button>
              </div>
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
      <DialogContent className="sm:max-w-[900px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create New Organization</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <div className="mb-8">
            <Progress value={(currentStep / 4) * 100} className="h-3" />
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>Organization Details</span>
              <span>Add Sites</span>
              <span>Add Devices</span>
              <span>Invite Members</span>
            </div>
          </div>
          {renderStep()}
        </div>
      </DialogContent>
    </Dialog>
  )
}

const createOrganization = async (data: z.infer<typeof createOrgSchema>) => {
  // Simulating API call
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return { ...data, id: Math.random().toString(36).substr(2, 9) }
}

const inviteMembers = async (data: z.infer<typeof inviteMembersSchema>) => {
  // Simulating API call
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return { success: true, invitedMembers: data.members.length }
}

