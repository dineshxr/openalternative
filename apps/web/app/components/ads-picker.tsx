import { formatDateRange } from "@curiousleaf/utils"
import type { Sponsoring } from "@openalternative/db"
import type { SponsoringType } from "@openalternative/db"
import type { SerializeFrom } from "@remix-run/node"
import { useFetcher } from "@remix-run/react"
import { cx } from "cva"
import { endOfDay, startOfDay } from "date-fns"
import { XIcon } from "lucide-react"
import plur from "plur"
import { type HTMLAttributes, useEffect } from "react"
import type { DateRange } from "react-day-picker"
import { AdsCalendar } from "~/components/ads-calendar"
import { PlanPayments } from "~/components/plan-payments"
import { Price } from "~/components/price"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Stack } from "~/components/ui/stack"
import { Tooltip, TooltipProvider } from "~/components/ui/tooltip"
import { useAds } from "~/hooks/use-ads"
import type { action } from "~/routes/api.stripe.create-checkout"

type AdsCalendarProps = HTMLAttributes<HTMLDivElement> & {
  sponsorings: SerializeFrom<Sponsoring>[]
}

const calendars: AdsCalendar[] = [
  {
    label: "Homepage Ad",
    type: "Homepage",
    description: "Visible on the homepage and search",
    price: 15,
    preview: "https://share.cleanshot.com/7CFqSw0b",
  },
  {
    label: "Banner Ad",
    type: "Banner",
    description: "Visible on every page of the website",
    price: 25,
    preview: "https://share.cleanshot.com/SvqTztKT",
  },
]

type AdsSelection = {
  type: SponsoringType
  dateRange?: DateRange
  duration?: number
}

export const AdsPicker = ({ className, sponsorings, ...props }: AdsCalendarProps) => {
  const { data, state, submit } = useFetcher<typeof action>()
  const { price, selections, hasSelections, clearSelection, updateSelection } = useAds({
    calendars,
  })

  useEffect(() => {
    if (data?.url) window.location.href = data.url
  }, [data])

  return (
    <TooltipProvider delayDuration={250} disableHoverableContent>
      <div className={cx("flex flex-wrap justify-center gap-4", className)} {...props}>
        <div className="flex flex-col w-full border divide-y rounded-md">
          <div className="flex flex-col w-full sm:flex-row sm:divide-x max-sm:divide-y">
            {calendars.map(calendar => (
              <AdsCalendar
                key={calendar.type}
                calendar={calendar}
                sponsorings={sponsorings}
                price={price}
                selections={selections}
                updateSelection={updateSelection}
              />
            ))}
          </div>

          {hasSelections && (
            <div className="flex flex-col gap-3 text-sm text-muted p-4">
              {selections.map(selection => {
                if (!selection.dateRange?.from || !selection.dateRange?.to || !selection.duration) {
                  return null
                }

                const calendar = calendars.find(p => p.type === selection.type)
                if (!calendar) return null

                const from = startOfDay(selection.dateRange.from)
                const to = endOfDay(selection.dateRange.to)

                return (
                  <p key={selection.type} className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <span className="flex items-center gap-2 mr-auto">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="p-0.5"
                        aria-label={`Clear ${calendar.label} selection`}
                        prefix={<XIcon />}
                        onClick={() => clearSelection(selection.type)}
                      />

                      <div>
                        <strong className="font-medium text-foreground">{calendar.label}</strong> –
                        ({selection.duration} {plur("day", selection.duration)})
                      </div>
                    </span>

                    <span>{formatDateRange(from, to)}</span>
                  </p>
                )
              })}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted text-center p-4 sm:justify-between sm:text-start">
            {price ? (
              <>
                <Stack size="sm" className="mr-auto">
                  Total:
                  <Price
                    price={price.discountedPrice}
                    fullPrice={price.totalPrice}
                    priceClassName="text-foreground text-base"
                  />
                </Stack>

                {price.discountPercentage > 0 && (
                  <Tooltip tooltip="Discount applied based on the order value. Max 30% off.">
                    <Badge
                      size="lg"
                      variant="outline"
                      className="-my-1 text-green-700/90 dark:text-green-300/90"
                    >
                      {price.discountPercentage}% off
                    </Badge>
                  </Tooltip>
                )}
              </>
            ) : (
              <p>Please select dates for at least one ad type</p>
            )}

            <Button
              variant="fancy"
              size="lg"
              disabled={!hasSelections}
              isPending={state === "submitting"}
              className="max-sm:w-full sm:-my-2"
              // onClick={handleCheckout}
            >
              Purchase Now
            </Button>
          </div>
        </div>

        <PlanPayments />
      </div>
    </TooltipProvider>
  )
}