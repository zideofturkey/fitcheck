import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface FoodItem {
  id: string;
  foodName: string;
  brandName?: string | null;
  category?: string | null;
  creationSource?: string | null;
}

interface FoodPickerComboboxProps {
  /** List of food items to display */
  foodItems: FoodItem[];
  /** Whether the food items are loading */
  isLoading: boolean;
  /** Callback when a food is selected */
  onSelect: (food: FoodItem) => void;
  /** Callback when the search input changes */
  onSearch: (term: string) => void;
  /** Current value of the search input */
  searchTerm: string;
  /** Currently selected food ID */
  selectedFoodId?: string | null;
  /** Message to show when no foods match the search */
  emptyMessage: string;
}

export default function FoodPickerCombobox({
  foodItems,
  isLoading,
  onSelect,
  onSearch,
  searchTerm,
  selectedFoodId,
  emptyMessage,
}: FoodPickerComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selectedFood = foodItems.find((f) => f.id === selectedFoodId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedFood ? (
            <span className="truncate">
              {selectedFood.foodName}
              {selectedFood.brandName ? ` - ${selectedFood.brandName}` : ""}
            </span>
          ) : (
            <span className="text-muted-foreground">Select food...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search foods..."
            value={searchTerm}
            onValueChange={onSearch}
          />
          <CommandList>
            {isLoading ? (
              <div className="space-y-2 p-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <>
                <CommandEmpty>{emptyMessage}</CommandEmpty>
                <CommandGroup>
                  {foodItems.map((food) => (
                    <CommandItem
                      key={food.id}
                      value={food.id}
                      onSelect={() => {
                        onSelect(food);
                        setOpen(false);
                      }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate font-medium">
                          {food.foodName}
                        </span>
                        {food.brandName && (
                          <span className="text-xs text-muted-foreground truncate">
                            {food.brandName}
                          </span>
                        )}
                      </div>
                      <div className="ml-2 flex items-center gap-1.5 shrink-0">
                        {food.category && (
                          <Badge
                            variant="secondary"
                            className="text-xs px-1.5 py-0.5"
                          >
                            {food.category}
                          </Badge>
                        )}
                        {food.creationSource === "aiAssistant" && (
                          <Badge
                            variant="outline"
                            className="text-xs px-1.5 py-0.5 border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-600 dark:bg-purple-950 dark:text-purple-300"
                          >
                            AI
                          </Badge>
                        )}
                      </div>
                      <Check
                        className={cn(
                          "ml-2 h-4 w-4 shrink-0",
                          selectedFoodId === food.id
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
