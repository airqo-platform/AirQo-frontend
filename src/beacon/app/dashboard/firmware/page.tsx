"use client"

import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Upload, 
  Download, 
  Search, 
  Info, 
  Package, 
  Calendar,
  FileCode,
  Edit2,
  Check,
  X,
  Plus,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import firmwareService from '@/services/firmware.service';
import { FirmwareVersion, FirmwareType } from '@/types/firmware.types';

const FirmwarePage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bootloaderInputRef = useRef<HTMLInputElement>(null);

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadDialog, setUploadDialog] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [selectedFirmware, setSelectedFirmware] = useState<FirmwareVersion | null>(null);

  // Upload form state
  const [firmwareVersion, setFirmwareVersion] = useState("");
  const [firmwareType, setFirmwareType] = useState<FirmwareType>(FirmwareType.BETA);
  const [description, setDescription] = useState("");
  const [firmwareFile, setFirmwareFile] = useState<File | null>(null);
  const [bootloaderFile, setBootloaderFile] = useState<File | null>(null);
  const [changelog, setChangelog] = useState<string[]>([""]);

  // Edit firmware type state
  const [isEditingType, setIsEditingType] = useState(false);
  const [editedFirmwareType, setEditedFirmwareType] = useState<FirmwareType>(FirmwareType.BETA);

  // Fetch firmware versions
  const { data: firmwareVersions = [], isLoading, error, refetch } = useQuery({
    queryKey: ['firmwares'],
    queryFn: () => firmwareService.getAllFirmwares({ limit: 1000 }),
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: (data: any) => firmwareService.uploadFirmware(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Firmware uploaded successfully!",
      });
      setUploadDialog(false);
      resetUploadForm();
      queryClient.invalidateQueries({ queryKey: ['firmwares'] });
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.response?.data?.detail || "An error occurred while uploading",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      firmwareService.updateFirmware(id, data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Firmware type updated successfully!",
      });
      setIsEditingType(false);
      queryClient.invalidateQueries({ queryKey: ['firmwares'] });
      if (selectedFirmware) {
        firmwareService.getFirmwareById(selectedFirmware.id).then(setSelectedFirmware);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.response?.data?.detail || "An error occurred while updating",
        variant: "destructive",
      });
    },
  });

  // Initialize edited firmware type when selecting firmware
  useEffect(() => {
    if (selectedFirmware && selectedFirmware.firmware_type) {
      setEditedFirmwareType(selectedFirmware.firmware_type);
    }
  }, [selectedFirmware]);

  // Reset upload form
  const resetUploadForm = () => {
    setFirmwareVersion("");
    setFirmwareType(FirmwareType.BETA);
    setDescription("");
    setFirmwareFile(null);
    setBootloaderFile(null);
    setChangelog([""]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (bootloaderInputRef.current) bootloaderInputRef.current.value = "";
  };

  // Changelog management
  const addChange = () => {
    if (changelog.length < 10) {
      setChangelog([...changelog, ""]);
    }
  };

  const updateChange = (index: number, value: string) => {
    const newChanges = [...changelog];
    newChanges[index] = value;
    setChangelog(newChanges);
  };

  const removeChange = (index: number) => {
    if (changelog.length > 1) {
      setChangelog(changelog.filter((_, i) => i !== index));
    }
  };

  // Handle firmware upload
  const handleUpload = async () => {
    if (!firmwareVersion || !description || !firmwareFile) {
      toast({
        title: "Missing required fields",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    const uploadData: any = {
      firmware_version: firmwareVersion,
      firmware_type: firmwareType,
      description: description,
      firmware_file: firmwareFile,
      firmware_bootloader: bootloaderFile,
    };

    // Add changelog entries
    changelog.forEach((change, index) => {
      if (change.trim()) {
        uploadData[`change${index + 1}`] = change.trim();
      }
    });

    uploadMutation.mutate(uploadData);
  };

  // Handle firmware type update
  const handleUpdateFirmwareType = () => {
    if (!selectedFirmware) return;

    updateMutation.mutate({
      id: selectedFirmware.id,
      data: { firmware_type: editedFirmwareType },
    });
  };

  // Handle file download
  const handleDownload = async (firmware: FirmwareVersion, fileType: 'bin' | 'hex' | 'bootloader') => {
    try {
      let canDownload = false;
      let filename = '';

      if (fileType === 'hex' && firmware.firmware_string_hex) {
        canDownload = true;
        filename = `${firmware.firmware_version}.hex`;
      } else if (fileType === 'bin' && firmware.firmware_string) {
        canDownload = true;
        filename = `${firmware.firmware_version}.bin`;
      } else if (fileType === 'bootloader' && firmware.firmware_string_bootloader) {
        canDownload = true;
        filename = `${firmware.firmware_version}_bootloader.hex`;
      }

      if (!canDownload) {
        toast({
          title: "File not available",
          description: `${fileType.toUpperCase()} file is not available for this firmware version`,
          variant: "destructive",
        });
        return;
      }

      const blob = await firmwareService.downloadFirmware({
        firmware_id: firmware.id,
        file_type: fileType,
      });

      firmwareService.triggerDownload(blob, filename);

      toast({
        title: "Download started",
        description: `Downloading ${filename}`,
      });
    } catch (error: any) {
      toast({
        title: "Download failed",
        description: error.response?.data?.detail || "An error occurred while downloading",
        variant: "destructive",
      });
    }
  };

  // Show firmware details
  const showDetails = (firmware: FirmwareVersion) => {
    setSelectedFirmware(firmware);
    setDetailsDialog(true);
  };

  // Filter and sort firmware versions
  const filteredFirmware = firmwareVersions.filter(
    (fw) =>
      fw.firmware_version.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (fw.description && fw.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getFirmwareTypePriority = (type?: string | null) => {
    switch (type?.toLowerCase()) {
      case 'stable': return 1;
      case 'beta': return 2;
      case 'deprecated': return 3;
      case 'legacy': return 4;
      default: return 5;
    }
  };

  const sortedFirmware = [...filteredFirmware].sort((a, b) => {
    const priorityA = getFirmwareTypePriority(a.firmware_type);
    const priorityB = getFirmwareTypePriority(b.firmware_type);
    
    if (priorityA !== priorityB) return priorityA - priorityB;
    
    const dateA = new Date(a.created_at || 0).getTime();
    const dateB = new Date(b.created_at || 0).getTime();
    return dateB - dateA;
  });

  // Format date
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Get status badge
  const getStatusBadge = (type?: string | null) => {
    if (!type) return <Badge variant="secondary">Unknown</Badge>;
    
    const badgeColor = firmwareService.getFirmwareTypeBadgeColor(type);
    const variantMap: Record<string, any> = {
      'bg-green-500': 'default',
      'bg-blue-500': 'default',
      'bg-orange-500': 'destructive',
      'bg-gray-500': 'secondary',
    };

    return (
      <Badge variant={variantMap[badgeColor] || 'secondary'} className={badgeColor}>
        {type.toUpperCase()}
      </Badge>
    );
  };

  // Extract changelog
  const extractChanges = (firmware: FirmwareVersion): string[] => {
    const changes: string[] = [];
    for (let i = 1; i <= 10; i++) {
      const change = firmware[`change${i}` as keyof FirmwareVersion];
      if (change && typeof change === 'string') {
        changes.push(change);
      }
    }
    return changes;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Firmware Management</h1>
          <p className="text-muted-foreground">
            Manage device firmware versions and updates
          </p>
        </div>
        <Button onClick={() => setUploadDialog(true)} className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Firmware
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search firmware versions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Firmware List */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">Error loading firmware versions</p>
          </CardContent>
        </Card>
      ) : sortedFirmware.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">No firmware versions found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedFirmware.map((firmware) => (
            <Card key={firmware.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      {firmware.firmware_version}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {firmware.description || 'No description'}
                    </CardDescription>
                  </div>
                  {getStatusBadge(firmware.firmware_type)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {formatDate(firmware.created_at)}
                </div>

                {firmware.firmware_bin_size && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileCode className="h-4 w-4" />
                    Size: {firmwareService.formatFileSize(firmware.firmware_bin_size)}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {firmware.firmware_string && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(firmware, 'bin')}
                      className="gap-1"
                    >
                      <Download className="h-3 w-3" />
                      BIN
                    </Button>
                  )}
                  {firmware.firmware_string_hex && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(firmware, 'hex')}
                      className="gap-1"
                    >
                      <Download className="h-3 w-3" />
                      HEX
                    </Button>
                  )}
                  {firmware.firmware_string_bootloader && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(firmware, 'bootloader')}
                      className="gap-1"
                    >
                      <Download className="h-3 w-3" />
                      Bootloader
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => showDetails(firmware)}
                    className="gap-1"
                  >
                    <Info className="h-3 w-3" />
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialog} onOpenChange={setUploadDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload New Firmware</DialogTitle>
            <DialogDescription>
              Upload a new firmware version for your IoT devices.
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="hex" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="hex">HEX File Upload</TabsTrigger>
              <TabsTrigger value="bin">Binary File Upload</TabsTrigger>
            </TabsList>
            <TabsContent value="hex" className="p-1 mt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="firmwareVersion" className="text-right">
                    Version
                  </Label>
                  <Input
                    id="firmwareVersion"
                    placeholder="e.g. v2.1.5"
                    className="col-span-3"
                    value={firmwareVersion}
                    onChange={(e) => setFirmwareVersion(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the changes in this version"
                    className="col-span-3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right pt-2">Firmware HEX</Label>
                  <div className="col-span-3">
                    <Input
                      id="firmwareHex"
                      type="file"
                      accept=".hex"
                      ref={fileInputRef}
                      onChange={(e) => setFirmwareFile(e.target.files?.[0] || null)}
                    />
                    <p className="text-xs text-gray-500 mt-1">Upload the HEX file for the main firmware</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right pt-2">Bootloader (Optional)</Label>
                  <div className="col-span-3">
                    <Input
                      id="firmware_bootloader"
                      type="file"
                      accept=".hex"
                      ref={bootloaderInputRef}
                      onChange={(e) => setBootloaderFile(e.target.files?.[0] || null)}
                    />
                    <p className="text-xs text-gray-500 mt-1">Upload bootloader HEX file if required</p>
                  </div>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-sm font-medium mb-3">Changelog</h3>
                  {changelog.map((item, index) => (
                    <div key={`change${index}`} className="grid grid-cols-4 items-center gap-4 mb-3">
                      <Label htmlFor={`change${index}`} className="text-right">
                        Change {index + 1}
                      </Label>
                      <Input
                        id={`change${index}`}
                        value={item}
                        onChange={(e) => updateChange(index, e.target.value)}
                        placeholder="e.g. Fixed WiFi connectivity issue"
                        className="col-span-3"
                      />
                    </div>
                  ))}
                  {changelog.length < 10 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={addChange}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Change
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="bin" className="p-1 mt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="firmwareVersionBin" className="text-right">
                    Version
                  </Label>
                  <Input 
                    id="firmwareVersionBin" 
                    placeholder="e.g. v2.1.5" 
                    className="col-span-3"
                    value={firmwareVersion}
                    onChange={(e) => setFirmwareVersion(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="descriptionBin" className="text-right">
                    Description
                  </Label>
                  <Textarea 
                    id="descriptionBin" 
                    placeholder="Describe the changes in this version" 
                    className="col-span-3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right pt-2">Firmware Binary</Label>
                  <div className="col-span-3">
                    <Input 
                      id="firmwareBin" 
                      type="file" 
                      accept=".bin"
                      onChange={(e) => setFirmwareFile(e.target.files?.[0] || null)}
                    />
                    <p className="text-xs text-gray-500 mt-1">Upload the binary firmware file</p>
                  </div>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-sm font-medium mb-3">Changelog</h3>
                  {changelog.map((item, index) => (
                    <div key={`changeBin${index}`} className="grid grid-cols-4 items-center gap-4 mb-3">
                      <Label htmlFor={`changeBin${index}`} className="text-right">
                        Change {index + 1}
                      </Label>
                      <Input
                        id={`changeBin${index}`}
                        value={item}
                        onChange={(e) => updateChange(index, e.target.value)}
                        placeholder="e.g. Fixed WiFi connectivity issue"
                        className="col-span-3"
                      />
                    </div>
                  ))}
                  {changelog.length < 10 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={addChange}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Change
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setUploadDialog(false)} disabled={uploadMutation.isPending}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={uploadMutation.isPending}>
              {uploadMutation.isPending ? (
                <>
                  <span className="mr-2">Uploading...</span>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" /> Upload Firmware
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsDialog} onOpenChange={setDetailsDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Firmware Details</DialogTitle>
          </DialogHeader>

          {selectedFirmware && (
            <div className="space-y-6">
              {/* Version and Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Version</Label>
                  <p className="text-lg font-semibold">{selectedFirmware.firmware_version}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Type</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {isEditingType ? (
                      <>
                        <Select
                          value={editedFirmwareType}
                          onValueChange={(value) => setEditedFirmwareType(value as FirmwareType)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={FirmwareType.STABLE}>Stable</SelectItem>
                            <SelectItem value={FirmwareType.BETA}>Beta</SelectItem>
                            <SelectItem value={FirmwareType.DEPRECATED}>Deprecated</SelectItem>
                            <SelectItem value={FirmwareType.LEGACY}>Legacy</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={handleUpdateFirmwareType}
                          disabled={updateMutation.isPending}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setIsEditingType(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        {getStatusBadge(selectedFirmware.firmware_type)}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setIsEditingType(true)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="mt-1">{selectedFirmware.description || 'No description'}</p>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Created At</Label>
                  <p className="mt-1">{formatDate(selectedFirmware.created_at)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Updated At</Label>
                  <p className="mt-1">{formatDate(selectedFirmware.updated_at)}</p>
                </div>
              </div>

              {/* File Information */}
              <div>
                <Label className="text-muted-foreground">File Information</Label>
                <div className="mt-2 space-y-2">
                  {selectedFirmware.firmware_bin_size && (
                    <p className="text-sm">
                      Size: {firmwareService.formatFileSize(selectedFirmware.firmware_bin_size)}
                    </p>
                  )}
                  {selectedFirmware.crc32 && (
                    <p className="text-sm font-mono">
                      CRC32: {selectedFirmware.crc32}
                    </p>
                  )}
                </div>
              </div>

              {/* Changelog */}
              {extractChanges(selectedFirmware).length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Changelog</Label>
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    {extractChanges(selectedFirmware).map((change, index) => (
                      <li key={index} className="text-sm">{change}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Download Buttons */}
              <div>
                <Label className="text-muted-foreground">Download Files</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedFirmware.firmware_string && (
                    <Button
                      variant="outline"
                      onClick={() => handleDownload(selectedFirmware, 'bin')}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download BIN
                    </Button>
                  )}
                  {selectedFirmware.firmware_string_hex && (
                    <Button
                      variant="outline"
                      onClick={() => handleDownload(selectedFirmware, 'hex')}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download HEX
                    </Button>
                  )}
                  {selectedFirmware.firmware_string_bootloader && (
                    <Button
                      variant="outline"
                      onClick={() => handleDownload(selectedFirmware, 'bootloader')}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download Bootloader
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FirmwarePage;
