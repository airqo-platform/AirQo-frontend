"use client"

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  PlusCircle,
  Layers,
  Settings,
  Plus,
  X,
  ChevronRight
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import categoryService from '@/services/category.service';
import { Category, CategoryCreate } from '@/types/category.types';

interface FieldEntry {
  value: string;
  type: 'string' | 'int' | 'float';
}

const CategoriesPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [newCategoryDialog, setNewCategoryDialog] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  // Form states
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [fields, setFields] = useState<FieldEntry[]>([
    { value: "", type: 'string' },
    { value: "", type: 'string' },
    { value: "", type: 'string' }
  ]);
  const [configs, setConfigs] = useState<FieldEntry[]>([
    { value: "", type: 'string' },
    { value: "", type: 'string' }
  ]);
  const [metadata, setMetadata] = useState<FieldEntry[]>([
    { value: "", type: 'string' },
    { value: "", type: 'string' }
  ]);

  // Fetch categories
  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAllCategories({ limit: 1000 }),
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: (data: CategoryCreate) => categoryService.createCategory(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Category created successfully!",
      });
      setNewCategoryDialog(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      console.error("Category creation error:", error);
      toast({
        title: "Creation failed",
        description: error.response?.data?.detail || "An error occurred while creating the category",
        variant: "destructive",
      });
    },
  });

  // Field management functions
  const addField = () => {
    if (fields.length < 15) {
      setFields([...fields, { value: "", type: 'string' }]);
    } else {
      toast({
        title: "Maximum fields reached",
        description: "You can only add up to 15 data fields.",
        variant: "destructive",
      });
    }
  };

  const removeField = (index: number) => {
    if (fields.length > 1) {
      const newFields = [...fields];
      newFields.splice(index, 1);
      setFields(newFields);
    }
  };

  const updateField = (index: number, value: string) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], value };
    setFields(newFields);
  };

  const updateFieldType = (index: number, type: 'string' | 'int' | 'float') => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], type };
    setFields(newFields);
  };

  // Config management functions
  const addConfig = () => {
    if (configs.length < 10) {
      setConfigs([...configs, { value: "", type: 'string' }]);
    } else {
      toast({
        title: "Maximum configurations reached",
        description: "You can only add up to 10 configuration parameters.",
        variant: "destructive",
      });
    }
  };

  const removeConfig = (index: number) => {
    if (configs.length > 1) {
      const newConfigs = [...configs];
      newConfigs.splice(index, 1);
      setConfigs(newConfigs);
    }
  };

  const updateConfig = (index: number, value: string) => {
    const newConfigs = [...configs];
    newConfigs[index] = { ...newConfigs[index], value };
    setConfigs(newConfigs);
  };

  const updateConfigType = (index: number, type: 'string' | 'int' | 'float') => {
    const newConfigs = [...configs];
    newConfigs[index] = { ...newConfigs[index], type };
    setConfigs(newConfigs);
  };

  // Metadata management functions
  const addMetadata = () => {
    if (metadata.length < 15) {
      setMetadata([...metadata, { value: "", type: 'string' }]);
    } else {
      toast({
        title: "Maximum metadata fields reached",
        description: "You can only add up to 15 metadata fields.",
        variant: "destructive",
      });
    }
  };

  const removeMetadata = (index: number) => {
    if (metadata.length > 1) {
      const newMetadata = [...metadata];
      newMetadata.splice(index, 1);
      setMetadata(newMetadata);
    }
  };

  const updateMetadata = (index: number, value: string) => {
    const newMetadata = [...metadata];
    newMetadata[index] = { ...newMetadata[index], value };
    setMetadata(newMetadata);
  };

  const updateMetadataType = (index: number, type: 'string' | 'int' | 'float') => {
    const newMetadata = [...metadata];
    newMetadata[index] = { ...newMetadata[index], type };
    setMetadata(newMetadata);
  };

  const resetForm = () => {
    setCategoryName("");
    setCategoryDescription("");
    setFields([
      { value: "", type: 'string' },
      { value: "", type: 'string' },
      { value: "", type: 'string' }
    ]);
    setConfigs([
      { value: "", type: 'string' },
      { value: "", type: 'string' }
    ]);
    setMetadata([
      { value: "", type: 'string' },
      { value: "", type: 'string' }
    ]);
  };

  const handleCreateCategory = async () => {
    if (!categoryName.trim()) {
      toast({
        title: "Missing required field",
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingCategory(true);
    
    try {
      const fieldsObj: { [key: string]: string | null } = {};
      fields.forEach((field, index) => {
        if (field.value.trim()) {
          fieldsObj[`field${index + 1}`] = field.value;
        }
      });
      
      const configsObj: { [key: string]: string | null } = {};
      configs.forEach((config, index) => {
        if (config.value.trim()) {
          configsObj[`config${index + 1}`] = config.value;
        }
      });
      
      const metadataObj: { [key: string]: string | null } = {};
      metadata.forEach((meta, index) => {
        if (meta.value.trim()) {
          metadataObj[`metadata${index + 1}`] = meta.value;
        }
      });
      
      const categoryData: CategoryCreate = {
        name: categoryName,
        description: categoryDescription || null,
        fields: Object.keys(fieldsObj).length > 0 ? fieldsObj : null,
        configs: Object.keys(configsObj).length > 0 ? configsObj : null,
        metadata: Object.keys(metadataObj).length > 0 ? metadataObj : null,
      };
      
      await createCategoryMutation.mutateAsync(categoryData);
      
    } catch (err: any) {
      // Error is handled by the mutation
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Device Categories</h1>
          <p className="text-gray-600 mt-1">Create and manage categories for your IoT devices</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Dialog open={newCategoryDialog} onOpenChange={setNewCategoryDialog}>
            <Button 
              onClick={() => setNewCategoryDialog(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <PlusCircle className="h-4 w-4 mr-2" /> New Category
            </Button>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Category</DialogTitle>
                <DialogDescription>
                  Define a new device category with custom fields, configurations, and metadata
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Category Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., AirQo Monitor, Weather Station"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the purpose of this category..."
                      value={categoryDescription}
                      onChange={(e) => setCategoryDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                {/* Data Fields */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Data Fields (up to 15)</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={addField}
                      disabled={fields.length >= 15}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Field
                    </Button>
                  </div>
                  {fields.map((field, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        placeholder={`Field ${index + 1} name`}
                        value={field.value}
                        onChange={(e) => updateField(index, e.target.value)}
                        className="flex-1"
                      />
                      <Select 
                        value={field.type} 
                        onValueChange={(value: 'string' | 'int' | 'float') => 
                          updateFieldType(index, value)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">String</SelectItem>
                          <SelectItem value="int">Integer</SelectItem>
                          <SelectItem value="float">Float</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeField(index)}
                        disabled={fields.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Configuration Parameters */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Configuration Parameters (up to 10)</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={addConfig}
                      disabled={configs.length >= 10}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Config
                    </Button>
                  </div>
                  {configs.map((config, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        placeholder={`Config ${index + 1} name`}
                        value={config.value}
                        onChange={(e) => updateConfig(index, e.target.value)}
                        className="flex-1"
                      />
                      <Select 
                        value={config.type} 
                        onValueChange={(value: 'string' | 'int' | 'float') => 
                          updateConfigType(index, value)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">String</SelectItem>
                          <SelectItem value="int">Integer</SelectItem>
                          <SelectItem value="float">Float</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeConfig(index)}
                        disabled={configs.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Metadata Fields */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Metadata Fields (up to 15)</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={addMetadata}
                      disabled={metadata.length >= 15}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Metadata
                    </Button>
                  </div>
                  {metadata.map((meta, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        placeholder={`Metadata ${index + 1} name`}
                        value={meta.value}
                        onChange={(e) => updateMetadata(index, e.target.value)}
                        className="flex-1"
                      />
                      <Select 
                        value={meta.type} 
                        onValueChange={(value: 'string' | 'int' | 'float') => 
                          updateMetadataType(index, value)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">String</SelectItem>
                          <SelectItem value="int">Integer</SelectItem>
                          <SelectItem value="float">Float</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMetadata(index)}
                        disabled={metadata.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setNewCategoryDialog(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateCategory}
                  disabled={isCreatingCategory}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isCreatingCategory ? "Creating..." : "Create Category"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search categories..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))
        ) : error ? (
          // Error state
          <div className="col-span-full text-center py-10">
            <p className="text-red-500">Error loading categories</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          // Empty state
          <div className="col-span-full text-center py-10">
            <Layers className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No categories found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? "Try a different search term" : "Get started by creating a new category"}
            </p>
          </div>
        ) : (
          // Categories list
          filteredCategories.map((category) => (
            <Card 
              key={category.name} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/dashboard/category/${encodeURIComponent(category.name)}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Layers className="h-8 w-8 text-blue-600" />
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
                <CardTitle className="mt-4">{category.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {category.description || "No description provided"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Data Fields:</span>
                    <span className="font-medium">
                      {category.fields ? Object.keys(category.fields).length : 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Config Params:</span>
                    <span className="font-medium">
                      {category.configs ? Object.keys(category.configs).length : 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Metadata:</span>
                    <span className="font-medium">
                      {category.metadata ? Object.keys(category.metadata).length : 0}
                    </span>
                  </div>
                  <div className="pt-2 border-t">
                    <span className="text-xs text-gray-500">
                      Created: {formatDate(category.created_at)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
