/**
 * GroupHeader Component
 * Displays group title, icon, and badge metrics
 */

import React from 'react';
import { Chip } from '@heroui/react';
import { clsx as cx } from 'clsx';

import { calculateBadgeMetrics } from './grouping-utils';
import type { GroupHeaderProps, BadgeMetric } from '../types';

const DEFAULT_BADGE_METRICS: BadgeMetric[] = [
  {
    id: 'unread',
    label: 'unread',
    color: 'primary',
    variant: 'solid',
    condition: (item) => item.status === 'unread',
    priority: 3
  },
  {
    id: 'urgent',
    label: 'urgent',
    color: 'danger',
    variant: 'solid',
    condition: (item) => item.priority === 'urgent',
    priority: 2
  },
  {
    id: 'high',
    label: 'high',
    color: 'warning',
    variant: 'bordered',
    condition: (item) => item.priority === 'high',
    priority: 1
  }
];

/**
 * GroupHeader - Displays group information and metrics
 */
export const GroupHeader: React.FC<GroupHeaderProps> = ({
  title,
  items,
  groupingConfig,
  icon,
  className,
}) => {
  // Calculate badge metrics
  const badgeMetrics = groupingConfig.badgeMetrics || DEFAULT_BADGE_METRICS;
  const calculatedMetrics = calculateBadgeMetrics(items, badgeMetrics);

  return (
    <div className={cx(
      'flex items-center justify-between px-3 py-2 bg-default-50 border-b border-divider',
      className
    )}>
      {/* Title and Icon */}
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-medium text-foreground-700">
          {title}
        </h3>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2">
        {/* Total count badge - show if enabled */}
        {groupingConfig.showTotalCount !== false && (
          <Chip 
            size="sm" 
            variant="shadow" 
            color="success" 
            className="text-xs flex items-center px-1"
            data-testid={`total-count-${title}`}
          >
            {items.length}
          </Chip>
        )}
        
        {/* Dynamic badge metrics */}
        {calculatedMetrics.map(metric => (
          <Chip 
            key={metric.id}
            size="sm" 
            variant={metric.variant} 
            color={metric.color}
            className="text-xs flex items-center px-1"
            data-testid={`badge-${metric.id}-${title}`}
          >
            {metric.count} {metric.label}
          </Chip>
        ))}
      </div>
    </div>
  );
};

export default GroupHeader;