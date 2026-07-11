'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { CATEGORIES } from '@/lib/categories';
import type { ListingFilters as ListingFiltersType } from '@/types';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';

interface ListingFiltersProps {
  filters: ListingFiltersType;
  onChange: (filters: ListingFiltersType) => void;
}

export default function ListingFilters({ filters, onChange }: ListingFiltersProps) {
  const [keyword, setKeyword] = useState(filters.keyword || '');

  return (
    <div className="rounded-card border border-white/10 bg-surface p-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onChange({ ...filters, keyword, page: 1 });
        }}
        className="flex flex-col gap-4"
      >
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
            aria-hidden="true"
          />
          <input
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search services or products…"
            aria-label="Search listings"
            className="w-full rounded-lg border border-white/10 bg-surface-raised py-2.5 pl-11 pr-4 text-ink-primary placeholder:text-ink-faint focus:border-amber focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Select
            label="Type"
            value={filters.type || ''}
            onChange={(e) =>
              onChange({ ...filters, type: (e.target.value || undefined) as ListingFiltersType['type'], page: 1 })
            }
          >
            <option value="">All types</option>
            <option value="product">Products</option>
            <option value="service">Services</option>
          </Select>

          <Select
            label="Category"
            value={filters.category || ''}
            onChange={(e) => onChange({ ...filters, category: e.target.value || undefined, page: 1 })}
          >
            <option value="">All categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>

          <Input
            label="Min price"
            type="number"
            min={0}
            value={filters.minPrice ?? ''}
            onChange={(e) =>
              onChange({ ...filters, minPrice: e.target.value ? Number(e.target.value) : undefined, page: 1 })
            }
          />

          <Input
            label="Max price"
            type="number"
            min={0}
            value={filters.maxPrice ?? ''}
            onChange={(e) =>
              onChange({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined, page: 1 })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <Select
            label="Sort by"
            value={filters.sort || 'newest'}
            onChange={(e) => onChange({ ...filters, sort: e.target.value as ListingFiltersType['sort'], page: 1 })}
            className="max-w-[200px]"
          >
            <option value="newest">Newest first</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="rating">Highest rated</option>
          </Select>

          <Button type="submit" variant="primary" className="self-end">
            Search
          </Button>
        </div>
      </form>
    </div>
  );
}
