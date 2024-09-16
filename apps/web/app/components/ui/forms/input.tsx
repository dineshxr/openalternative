import { type InputHTMLAttributes, forwardRef } from "react"
import { type VariantProps, cva, cx } from "~/utils/cva"

export const inputVariants = cva({
  base: "w-full border appearance-none bg-background text-secondary resize-none [field-sizing:content] font-medium outline-offset-0 outline-primary placeholder:text-inherit placeholder:opacity-50 disabled:opacity-50",

  variants: {
    size: {
      sm: "px-2 py-1 text-[13px]/none font-normal rounded-md",
      md: "px-3 py-2 text-[13px]/tight rounded-md",
      lg: "px-4 py-2.5 text-sm/tight rounded-lg",
    },
    hoverable: {
      true: "bg-background enabled:cursor-pointer enabled:hover:bg-card enabled:hover:border-border-dark",
    },
  },

  defaultVariants: {
    size: "md",
  },
})

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> &
  VariantProps<typeof inputVariants>

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const { className, size, hoverable, ...rest } = props

  return <input ref={ref} className={cx(inputVariants({ size, hoverable, className }))} {...rest} />
})

Input.displayName = "Input"