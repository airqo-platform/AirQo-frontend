"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { groupsApi } from "@/core/apis/organizations";
import { useGroupsDetails } from "@/core/hooks/useGroups";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const formatTitle = (title: string) => {
  return title
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

interface OrganizationProfileProps {
  organizationId: string;
}

export function OrganizationProfile({
  organizationId,
}: OrganizationProfileProps) {
  const queryClient = useQueryClient();
  const { group, isLoading, error } = useGroupsDetails(organizationId);
  const [formData, setFormData] = useState({
    grp_title: "",
    grp_description: "",
    grp_website: "",
  });

  useEffect(() => {
    if (group) {
      setFormData({
        grp_title: group.grp_title || "",
        grp_description: group.grp_description || "",
        grp_website: group.grp_website || "",
      });
    }
  }, [group]);

  const updateMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      groupsApi.updateGroupDetailsApi(organizationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groupDetails", organizationId] });
      queryClient.invalidateQueries({ queryKey: ["groupDetails", organizationId] });
      toast({
        title: "Profile Updated",
        description: "The organization profile has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      console.error("Failed to update organization profile", error);
      toast({
        title: "Update Failed",
        description:
          "There was an error updating the organization profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return <Skeleton className="w-full h-[600px]" />;
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        Error loading organization details. Please try again.
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            <Avatar className="w-24 h-24 border-4 border-primary/10">
              <AvatarImage
                src={group?.grp_profile_picture}
                alt={formData.grp_title}
              />
              <AvatarFallback className="text-2xl">
                {formData.grp_title.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-semibold">
                {formatTitle(formData.grp_title)}
              </h2>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  group?.grp_status === "ACTIVE"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {group?.grp_status === "ACTIVE" ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="grp_title" className="text-sm font-medium">
                Organization Name
              </Label>
              <Input
                id="grp_title"
                name="grp_title"
                value={formatTitle(formData.grp_title)}
                onChange={handleInputChange}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="grp_website" className="text-sm font-medium">
                Website
              </Label>
              <Input
                id="grp_website"
                name="grp_website"
                value={formData.grp_website}
                onChange={handleInputChange}
                type="url"
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="grp_description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="grp_description"
              name="grp_description"
              value={formData.grp_description}
              onChange={handleInputChange}
              rows={4}
              className="w-full resize-none"
            />
          </div>

          <Button
            type="submit"
            className="w-full md:w-auto"
            disabled={updateMutation.status === "pending"}
          >
            {updateMutation.status === "pending" ? "Updating..." : "Update Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
