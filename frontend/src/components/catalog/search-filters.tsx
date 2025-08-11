"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const categories = [
  "Photography",
  "Sports & Recreation",
  "Tools & Equipment",
  "Outdoor Gear",
  "Electronics",
  "Home & Garden",
  "Party & Events",
  "Transportation",
];

const locations = [
  "San Francisco, CA",
  "Los Angeles, CA",
  "New York, NY",
  "Austin, TX",
  "Seattle, WA",
  "Denver, CO",
  "Miami, FL",
  "Chicago, IL",
];

export function SearchFilters() {
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [minRating, setMinRating] = useState(0);
  const [minGreenScore, setMinGreenScore] = useState(0);

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category]);
    } else {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    }
  };

  const handleLocationChange = (location: string, checked: boolean) => {
    if (checked) {
      setSelectedLocations([...selectedLocations, location]);
    } else {
      setSelectedLocations(selectedLocations.filter((l) => l !== location));
    }
  };

  const clearFilters = () => {
    setPriceRange([0, 500]);
    setSelectedCategories([]);
    setSelectedLocations([]);
    setDateRange({ from: undefined, to: undefined });
    setMinRating(0);
    setMinGreenScore(0);
  };

  const hasActiveFilters =
    priceRange[0] > 0 ||
    priceRange[1] < 500 ||
    selectedCategories.length > 0 ||
    selectedLocations.length > 0 ||
    dateRange.from ||
    minRating > 0 ||
    minGreenScore > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          <h2 className="font-semibold">Filters</h2>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Availability */}
      <div className="space-y-3">
        <h3 className="font-medium">Availability</h3>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !dateRange.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick dates</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <h3 className="font-medium">Price Range (per day)</h3>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={500}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}+</span>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <h3 className="font-medium">Categories</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={category}
                checked={selectedCategories.includes(category)}
                onCheckedChange={(checked) =>
                  handleCategoryChange(category, checked as boolean)
                }
              />
              <label
                htmlFor={category}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {category}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Locations */}
      <div className="space-y-3">
        <h3 className="font-medium">Locations</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {locations.map((location) => (
            <div key={location} className="flex items-center space-x-2">
              <Checkbox
                id={location}
                checked={selectedLocations.includes(location)}
                onCheckedChange={(checked) =>
                  handleLocationChange(location, checked as boolean)
                }
              />
              <label
                htmlFor={location}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {location}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className="space-y-3">
        <h3 className="font-medium">Minimum Rating</h3>
        <div className="px-2">
          <Slider
            value={[minRating]}
            onValueChange={(value) => setMinRating(value[0])}
            max={5}
            step={0.5}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>Any</span>
            <span>{minRating}+ stars</span>
          </div>
        </div>
      </div>

      {/* Green Score */}
      <div className="space-y-3">
        <h3 className="font-medium">Green Score</h3>
        <div className="px-2">
          <Slider
            value={[minGreenScore]}
            onValueChange={(value) => setMinGreenScore(value[0])}
            max={100}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>Any</span>
            <span>{minGreenScore}+</span>
          </div>
        </div>
      </div>
    </div>
  );
}
