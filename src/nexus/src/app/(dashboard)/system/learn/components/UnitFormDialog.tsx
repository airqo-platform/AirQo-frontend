'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, Input, toast } from '@/shared/components/ui';
import { learnAdminService } from '@/shared/services';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import type {
  CreateUnitRequest,
  Course,
  Unit,
  UpdateUnitRequest,
} from '@/shared/types/learn';
import { getNextUnitOrder } from '../utils';

interface UnitFormDialogProps {
  isOpen: boolean;
  course: Course | null;
  unit: Unit | null;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}

const UnitFormDialog: React.FC<UnitFormDialogProps> = ({
  isOpen,
  course,
  unit,
  onClose,
  onSaved,
}) => {
  const [title, setTitle] = useState('');
  const [plainTitleKey, setPlainTitleKey] = useState('');
  const [unitOrder, setUnitOrder] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = Boolean(unit);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (unit) {
      setTitle(unit.title || '');
      setPlainTitleKey(unit.plain_title_key || '');
      setUnitOrder(String(unit.unit_order ?? ''));
    } else if (course) {
      setTitle('');
      setPlainTitleKey('');
      setUnitOrder(String(getNextUnitOrder(course)));
    } else {
      setTitle('');
      setPlainTitleKey('');
      setUnitOrder('1');
    }
  }, [isOpen, unit, course]);

  const handleClose = () => {
    if (isSaving) {
      return;
    }
    onClose();
  };

  const handleSubmit = async () => {
    const normalizedTitle = title.trim();
    const normalizedPlainTitleKey = plainTitleKey.trim();
    const parsedOrder = Number(unitOrder);

    if (!normalizedTitle) {
      toast.error('Unit title is required');
      return;
    }

    if (!normalizedPlainTitleKey) {
      toast.error('Plain title key is required');
      return;
    }

    if (
      !Number.isFinite(parsedOrder) ||
      parsedOrder < 1 ||
      !Number.isInteger(parsedOrder)
    ) {
      toast.error('Unit order must be a positive integer');
      return;
    }

    if (!isEditing && !course) {
      toast.error('Course is not available');
      return;
    }

    setIsSaving(true);

    try {
      if (isEditing && unit) {
        const payload: UpdateUnitRequest = {
          title: normalizedTitle,
          plain_title_key: normalizedPlainTitleKey,
          unit_order: parsedOrder,
        };

        await learnAdminService.updateUnit(unit._id, payload);
        toast.success('Unit updated successfully');
      } else if (course) {
        const payload: CreateUnitRequest = {
          title: normalizedTitle,
          plain_title_key: normalizedPlainTitleKey,
          unit_order: parsedOrder,
        };

        await learnAdminService.createUnit(course._id, payload);
        toast.success('Unit created successfully');
      }

      await onSaved();
      handleClose();
    } catch (error) {
      toast.error(getUserFriendlyErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Edit unit' : 'Add unit'}
      subtitle={
        isEditing
          ? 'Update unit metadata and order.'
          : 'Add a new unit to this course.'
      }
      size="lg"
      primaryAction={{
        label: isEditing ? 'Save changes' : 'Add unit',
        onClick: handleSubmit,
        loading: isSaving,
        disabled: isSaving,
      }}
      secondaryAction={{
        label: 'Cancel',
        onClick: handleClose,
        variant: 'outlined',
        disabled: isSaving,
      }}
    >
      <div className="space-y-4">
        <Input
          label="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Air basics"
          required
        />

        <Input
          label="Plain title key"
          value={plainTitleKey}
          onChange={e => setPlainTitleKey(e.target.value)}
          placeholder="Air basics"
          required
        />

        <Input
          label="Unit order"
          type="number"
          min={1}
          step={1}
          value={unitOrder}
          onChange={e => setUnitOrder(e.target.value)}
          placeholder="1"
          required
          description="Must be unique within the course."
        />
      </div>
    </Dialog>
  );
};

export default UnitFormDialog;
