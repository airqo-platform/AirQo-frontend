"use client"

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  PlusCircle,
  Edit,
  Package,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  ArrowDown,
  ArrowUp,
  FileDown
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import stockService from '@/services/stock.service';
import { ItemsStock, ItemsStockCreate, ItemsStockUpdate, ItemsStockResponse } from '@/types/stock.types';

const StockPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [newItemDialog, setNewItemDialog] = useState(false);
  const [updateItemDialog, setUpdateItemDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Form states for new item
  const [newItemName, setNewItemName] = useState("");
  const [newStock, setNewStock] = useState<number>(0);
  const [newUnit, setNewUnit] = useState("");

  // Form states for update
  const [selectedItem, setSelectedItem] = useState<ItemsStock | null>(null);
  const [updateItemName, setUpdateItemName] = useState("");
  const [stockOperation, setStockOperation] = useState<'in' | 'out'>('in');
  const [operationType, setOperationType] = useState<'current' | 'added' | 'removed'>('current');
  const [updateStockValue, setUpdateStockValue] = useState<number>(0);
  const [updateUnit, setUpdateUnit] = useState("");

  // Fetch stock items
  const { data: stockData, isLoading, error } = useQuery<ItemsStockResponse>({
    queryKey: ['stock-items'],
    queryFn: () => stockService.getAllItems({ page: 1, page_size: 100 }) as Promise<ItemsStockResponse>,
  });

  // Create item mutation
  const createItemMutation = useMutation({
    mutationFn: (data: ItemsStockCreate) => stockService.createItem(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Stock item created successfully!",
      });
      setNewItemDialog(false);
      resetNewItemForm();
      queryClient.invalidateQueries({ queryKey: ['stock-items'] });
    },
    onError: (error: any) => {
      console.error("Stock item creation error:", error);
      toast({
        title: "Creation failed",
        description: error.response?.data?.detail || "An error occurred while creating the stock item",
        variant: "destructive",
      });
    },
  });

  // Update item mutation
  const updateItemMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: ItemsStockUpdate }) =>
      stockService.updateItem(id, data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Stock item updated successfully!",
      });
      setUpdateItemDialog(false);
      setSelectedItem(null);
      queryClient.invalidateQueries({ queryKey: ['stock-items'] });
    },
    onError: (error: any) => {
      console.error("Stock item update error:", error);
      toast({
        title: "Update failed",
        description: error.response?.data?.detail || "An error occurred while updating the stock item",
        variant: "destructive",
      });
    },
  });

  const resetNewItemForm = () => {
    setNewItemName("");
    setNewStock(0);
    setNewUnit("");
  };

  const handleCreateItem = async () => {
    if (!newItemName.trim()) {
      toast({
        title: "Missing required field",
        description: "Item name is required",
        variant: "destructive",
      });
      return;
    }

    if (!newUnit.trim()) {
      toast({
        title: "Missing required field",
        description: "Unit is required",
        variant: "destructive",
      });
      return;
    }

    if (newStock < 0) {
      toast({
        title: "Invalid stock value",
        description: "Stock must be 0 or greater",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      const itemData: ItemsStockCreate = {
        name: newItemName.trim(),
        stock: newStock,
        unit: newUnit.trim(),
      };

      await createItemMutation.mutateAsync(itemData);

    } catch (err: any) {
      // Error is handled by the mutation
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenUpdateDialog = (item: ItemsStock) => {
    setSelectedItem(item);
    setUpdateItemName(item.name);
    setUpdateUnit(item.unit);
    setStockOperation('in');
    setOperationType('current');
    setUpdateStockValue(item.stock);
    setUpdateItemDialog(true);
  };

  const handleUpdateItem = async () => {
    if (!selectedItem) return;

    if (updateStockValue < 0) {
      toast({
        title: "Invalid stock value",
        description: "Stock value must be 0 or greater",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);

    try {
      let finalStock: number;

      if (operationType === 'current') {
        // Use the value as the final stock
        finalStock = updateStockValue;
      } else if (operationType === 'added') {
        // Add to current stock
        finalStock = selectedItem.stock + updateStockValue;
      } else {
        // Remove from current stock
        finalStock = Math.max(0, selectedItem.stock - updateStockValue);
      }

      const updateData: ItemsStockUpdate = {
        stock: finalStock,
      };

      await updateItemMutation.mutateAsync({
        id: selectedItem.id,
        data: updateData
      });

    } catch (err: any) {
      // Error is handled by the mutation
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredItems = stockData?.items?.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getChangeIcon = (change: number | null | undefined) => {
    if (change === null || change === undefined || change === 0) {
      return <Minus className="h-4 w-4 text-gray-400" />;
    }
    if (change > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    }
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getChangeBadge = (change: number | null | undefined) => {
    if (change === null || change === undefined || change === 0) {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          {getChangeIcon(change)}
          <span>0</span>
        </Badge>
      );
    }
    if (change > 0) {
      return (
        <Badge variant="outline" className="flex items-center gap-1 border-green-200 bg-green-50 text-green-700">
          {getChangeIcon(change)}
          <span>+{change}</span>
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="flex items-center gap-1 border-red-200 bg-red-50 text-red-700">
        {getChangeIcon(change)}
        <span>{change}</span>
      </Badge>
    );
  };

  const getAllItemsForExport = async () => {
    try {
      // Fetch a large number of items to ensure we get everything
      // In a production environment with thousands of items, we should implement pagination looping
      const response = await stockService.getAllItems({ page: 1, page_size: 1000 }) as ItemsStockResponse;
      return response.items;
    } catch (error) {
      console.error("Error fetching items for export:", error);
      toast({
        title: "Export failed",
        description: "Could not fetch data for export",
        variant: "destructive",
      });
      return [];
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const items = await getAllItemsForExport();
      if (items.length === 0) return;

      const exportData = items.map(item => ({
        'Name': item.name,
        'Unit': item.unit,
        'Current Stock': item.stock,
        'Updated Date': item.updated_at ? new Date(item.updated_at).toLocaleDateString() : 'N/A',
        'Last Stock In Quantity': item.last_stock_addition || 0,
        'Last Stock In Date': item.last_stocked_at ? new Date(item.last_stocked_at).toLocaleDateString() : 'N/A',
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
      XLSX.writeFile(workbook, `inventory_export_${new Date().toISOString().split('T')[0]}.xlsx`);

      toast({
        title: "Export Successful",
        description: "Inventory data exported to Excel",
      });
    } catch (error) {
      console.error("Excel export error:", error);
      toast({
        title: "Export Failed",
        description: "An error occurred while exporting to Excel",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const items = await getAllItemsForExport();
      if (items.length === 0) return;

      const doc = new jsPDF();

      // Add title
      doc.setFontSize(18);
      doc.text("Inventory Report", 14, 22);

      doc.setFontSize(11);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

      const tableColumn = [
        "Name",
        "Unit",
        "Current Stock",
        "Updated",
        "Last Stock In (Qty)",
        "Last Stock In (Date)"
      ];

      const tableRows = items.map(item => [
        item.name,
        item.unit,
        item.stock.toString(),
        item.updated_at ? new Date(item.updated_at).toLocaleDateString() : 'N/A',
        (item.last_stock_addition || 0).toString(),
        item.last_stocked_at ? new Date(item.last_stocked_at).toLocaleDateString() : 'N/A'
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] }
      });

      doc.save(`inventory_report_${new Date().toISOString().split('T')[0]}.pdf`);

      toast({
        title: "Export Successful",
        description: "Inventory data exported to PDF",
      });
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        title: "Export Failed",
        description: "An error occurred while exporting to PDF",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Stock Management</h1>
          <p className="text-gray-600 mt-1">Manage your inventory and track stock levels</p>
        </div>
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2" disabled={isExporting}>
                <FileDown className="h-4 w-4" />
                {isExporting ? "Exporting..." : "Export"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportExcel}>
                Export to Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF}>
                Export to PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={newItemDialog} onOpenChange={setNewItemDialog}>
            <Button
              onClick={() => setNewItemDialog(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <PlusCircle className="h-4 w-4 mr-2" /> Add Item
            </Button>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Stock Item</DialogTitle>
                <DialogDescription>
                  Create a new item in your inventory
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="new-name">Item Name *</Label>
                  <Input
                    id="new-name"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Enter item name"
                  />
                </div>

                <div>
                  <Label htmlFor="new-stock">Initial Stock Quantity *</Label>
                  <Input
                    id="new-stock"
                    type="number"
                    min="0"
                    value={newStock}
                    onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                    placeholder="Enter initial stock quantity"
                  />
                </div>

                <div>
                  <Label htmlFor="new-unit">Unit of Measurement *</Label>
                  <Input
                    id="new-unit"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="e.g., pieces, kg, liters"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setNewItemDialog(false);
                    resetNewItemForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateItem}
                  disabled={isCreating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isCreating ? "Creating..." : "Create Item"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search by name, unit or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stock Items Table */}
      <div className="bg-white rounded-lg border shadow-sm">
        {isLoading ? (
          <div className="p-8 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Error loading stock items</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No stock items found</p>
            <p className="text-sm text-gray-500">
              {searchTerm ? "Try adjusting your search" : "Get started by adding your first item"}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Change</TableHead>
                <TableHead>Last Stock In</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Updated Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.name}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {item.stock.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {getChangeBadge(item.change)}
                  </TableCell>
                  <TableCell>
                    {item.last_stock_addition !== null && item.last_stock_addition !== undefined ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="cursor-help">
                              <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                                +{item.last_stock_addition.toLocaleString()}
                              </Badge>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <div className="space-y-1">
                              <p className="font-semibold">Last StockIn Addition Details</p>
                              <p className="text-xs">
                                <span className="text-gray-500">Added:</span>{' '}
                                <span className="font-medium">{item.last_stock_addition.toLocaleString()}</span>
                              </p>
                              <p className="text-xs">
                                <span className="text-gray-500">Stock After:</span>{' '}
                                <span className="font-medium">{item.stock_after_last_addition?.toLocaleString() || 'N/A'}</span>
                              </p>
                              <p className="text-xs">
                                <span className="text-gray-500">Date:</span>{' '}
                                <span className="font-medium">{item.last_stocked_at ? formatDate(item.last_stocked_at) : 'N/A'}</span>
                              </p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{item.unit}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {formatDate(item.updated_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenUpdateDialog(item)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Update Dialog */}
      <Dialog open={updateItemDialog} onOpenChange={setUpdateItemDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Stock Item</DialogTitle>
            <DialogDescription>
              Adjust stock levels for {selectedItem?.name || 'this item'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg border">
              <div>
                <Label className="text-xs text-gray-500">Item Name</Label>
                <p className="font-medium text-sm mt-1">{updateItemName}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Unit</Label>
                <p className="font-medium text-sm mt-1">{updateUnit}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Current Stock</Label>
                <p className="font-semibold text-sm mt-1">{selectedItem?.stock.toLocaleString() || '0'}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <Label className="mb-3 block">Stock Operation</Label>
              <div className="flex gap-2 mb-4">
                <Button
                  type="button"
                  variant={stockOperation === 'in' ? 'default' : 'outline'}
                  onClick={() => {
                    setStockOperation('in');
                    setOperationType('added');
                  }}
                  className={`flex-1 ${stockOperation === 'in' && operationType !== 'current'
                    ? 'bg-green-600 hover:bg-green-700'
                    : stockOperation === 'in'
                      ? 'bg-gray-600 hover:bg-gray-700'
                      : ''
                    }`}
                >
                  <ArrowUp className="h-4 w-4 mr-2" />
                  Stock In
                </Button>
                <Button
                  type="button"
                  variant={stockOperation === 'out' ? 'default' : 'outline'}
                  onClick={() => {
                    setStockOperation('out');
                    setOperationType('removed');
                  }}
                  className={`flex-1 ${stockOperation === 'out' && operationType !== 'current'
                    ? 'bg-red-600 hover:bg-red-700'
                    : stockOperation === 'out'
                      ? 'bg-gray-600 hover:bg-gray-700'
                      : ''
                    }`}
                >
                  <ArrowDown className="h-4 w-4 mr-2" />
                  Stock Out
                </Button>
              </div>

              <div className="mb-4">
                <Label htmlFor="operation-type">Operation Type</Label>
                <Select
                  value={operationType}
                  onValueChange={(value: 'current' | 'added' | 'removed') => setOperationType(value)}
                >
                  <SelectTrigger id="operation-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Set Current Stock</SelectItem>
                    {stockOperation === 'in' ? (
                      <SelectItem value="added">Add to Stock</SelectItem>
                    ) : (
                      <SelectItem value="removed">Remove from Stock</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="update-stock-value">
                  {operationType === 'current'
                    ? 'New Stock Level'
                    : operationType === 'added'
                      ? 'Quantity to Add'
                      : 'Quantity to Remove'}
                </Label>
                <Input
                  id="update-stock-value"
                  type="number"
                  min="0"
                  value={updateStockValue}
                  onChange={(e) => setUpdateStockValue(parseInt(e.target.value) || 0)}
                  placeholder={
                    operationType === 'current'
                      ? 'Enter new stock level'
                      : operationType === 'added'
                        ? 'Enter quantity to add'
                        : 'Enter quantity to remove'
                  }
                />
                {operationType !== 'current' && (
                  <p className="text-sm text-gray-500 mt-1">
                    {operationType === 'added'
                      ? `New stock will be: ${(selectedItem?.stock || 0) + updateStockValue}`
                      : `New stock will be: ${Math.max(0, (selectedItem?.stock || 0) - updateStockValue)}`}
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setUpdateItemDialog(false);
                setSelectedItem(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateItem}
              disabled={isUpdating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isUpdating ? "Updating..." : "Update Stock"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Statistics Footer */}
      {stockData && stockData.items && stockData.items.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-800">{stockData.total}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Stock</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stockData.items.reduce((sum, item) => sum + item.stock, 0).toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Page</p>
                <p className="text-2xl font-bold text-gray-800">{stockData.page}</p>
              </div>
              <Search className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockPage;
