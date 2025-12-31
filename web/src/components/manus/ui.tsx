import { ComponentProps } from "react"

export function Button(props: ComponentProps<"button">) {
  const { className = "", ...rest } = props
  return <button className={`rounded-lg px-4 py-2 font-semibold ${className}`} {...rest} />
}

export function Card({ className = "", ...rest }: ComponentProps<"div">) {
  return <div className={`rounded-xl border border-slate-800 bg-slate-900 ${className}`} {...rest} />
}

export function CardHeader(props: ComponentProps<"div">) {
  const { className = "", ...rest } = props
  return <div className={`mb-4 ${className}`} {...rest} />
}

export function CardTitle(props: ComponentProps<"h3">) {
  const { className = "", ...rest } = props
  return <h3 className={`text-lg font-semibold text-white ${className}`} {...rest} />
}

export function CardDescription(props: ComponentProps<"p">) {
  const { className = "", ...rest } = props
  return <p className={`text-sm text-slate-400 ${className}`} {...rest} />
}

export function CardContent(props: ComponentProps<"div">) {
  const { className = "", ...rest } = props
  return <div className={`text-slate-200 ${className}`} {...rest} />
}

export function Badge(props: ComponentProps<"span">) {
  const { className = "", ...rest } = props
  return <span className={`inline-flex items-center rounded-full border border-slate-700 px-2 py-1 text-xs font-semibold uppercase tracking-wide ${className}`} {...rest} />
}
