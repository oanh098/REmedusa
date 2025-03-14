import { Button, Checkbox } from "@medusajs/ui"
import { RowSelectionState, createColumnHelper } from "@tanstack/react-table"
import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import * as zod from "zod"

import { zodResolver } from "@hookform/resolvers/zod"
import { HttpTypes } from "@medusajs/types"
import { keepPreviousData } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import {
  RouteFocusModal,
  useRouteModal,
} from "../../../../../components/modals"
import { DataTable } from "../../../../../components/table/data-table"
import { useUpdateProduct } from "../../../../../hooks/api/products"
import { useSalesChannels } from "../../../../../hooks/api/sales-channels"
import { useSalesChannelTableColumns } from "../../../../../hooks/table/columns/use-sales-channel-table-columns"
import { useSalesChannelTableFilters } from "../../../../../hooks/table/filters/use-sales-channel-table-filters"
import { useSalesChannelTableQuery } from "../../../../../hooks/table/query/use-sales-channel-table-query"
import { useDataTable } from "../../../../../hooks/use-data-table"

type EditSalesChannelsFormProps = {
  product: HttpTypes.AdminProduct
}

const EditSalesChannelsSchema = zod.object({
  sales_channels: zod.array(zod.string()).optional(),
})

const PAGE_SIZE = 50

export const EditSalesChannelsForm = ({
  product,
}: EditSalesChannelsFormProps) => {
  const { t } = useTranslation()
  const { handleSuccess } = useRouteModal()

  const form = useForm<zod.infer<typeof EditSalesChannelsSchema>>({
    defaultValues: {
      sales_channels: product.sales_channels?.map((sc) => sc.id) ?? [],
    },
    resolver: zodResolver(EditSalesChannelsSchema),
  })

  const { setValue } = form

  const initialState =
    product.sales_channels?.reduce((acc, curr) => {
      acc[curr.id] = true
      return acc
    }, {} as RowSelectionState) ?? {}

  const [rowSelection, setRowSelection] =
    useState<RowSelectionState>(initialState)

  useEffect(() => {
    const ids = Object.keys(rowSelection)
    setValue("sales_channels", ids, {
      shouldDirty: true,
      shouldTouch: true,
    })
  }, [rowSelection, setValue])

  const { searchParams, raw } = useSalesChannelTableQuery({
    pageSize: PAGE_SIZE,
  })
  const { sales_channels, count, isLoading, isError, error } = useSalesChannels(
    {
      ...searchParams,
    },
    {
      placeholderData: keepPreviousData,
    }
  )

  const filters = useSalesChannelTableFilters()
  const columns = useColumns()

  const { table } = useDataTable({
    data: sales_channels ?? [],
    columns,
    count,
    enablePagination: true,
    enableRowSelection: true,
    rowSelection: {
      state: rowSelection,
      updater: setRowSelection,
    },
    getRowId: (row) => row.id,
    pageSize: PAGE_SIZE,
  })

  const { mutateAsync, isPending: isMutating } = useUpdateProduct(product.id)

  const handleSubmit = form.handleSubmit(async (data) => {
    const arr = data.sales_channels ?? []

    const sales_channels = arr.map((id) => {
      return {
        id,
      }
    })

    await mutateAsync(
      {
        sales_channels,
      },
      {
        onSuccess: () => {
          handleSuccess()
        },
      }
    )
  })

  if (isError) {
    throw error
  }

  return (
    <RouteFocusModal.Form form={form}>
      <div className="flex h-full flex-col overflow-hidden">
        <RouteFocusModal.Header />
        <RouteFocusModal.Body className="flex-1 overflow-hidden">
          <DataTable
            table={table}
            columns={columns}
            pageSize={PAGE_SIZE}
            isLoading={isLoading}
            count={count}
            filters={filters}
            search="autofocus"
            pagination
            orderBy={[
              { key: "name", label: t("fields.name") },
              { key: "created_at", label: t("fields.createdAt") },
              { key: "updated_at", label: t("fields.updatedAt") },
            ]}
            queryObject={raw}
            layout="fill"
          />
        </RouteFocusModal.Body>
        <RouteFocusModal.Footer>
          <div className="flex items-center justify-end gap-x-2">
            <RouteFocusModal.Close asChild>
              <Button size="small" variant="secondary">
                {t("actions.cancel")}
              </Button>
            </RouteFocusModal.Close>
            <Button size="small" isLoading={isMutating} onClick={handleSubmit}>
              {t("actions.save")}
            </Button>
          </div>
        </RouteFocusModal.Footer>
      </div>
    </RouteFocusModal.Form>
  )
}

const columnHelper =
  createColumnHelper<HttpTypes.AdminSalesChannelResponse["sales_channel"]>()

const useColumns = () => {
  const columns = useSalesChannelTableColumns()

  return useMemo(
    () => [
      columnHelper.display({
        id: "select",
        header: ({ table }) => {
          return (
            <Checkbox
              checked={
                table.getIsSomePageRowsSelected()
                  ? "indeterminate"
                  : table.getIsAllPageRowsSelected()
              }
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
            />
          )
        },
        cell: ({ row }) => {
          return (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              onClick={(e) => {
                e.stopPropagation()
              }}
            />
          )
        },
      }),
      ...columns,
    ],
    [columns]
  )
}
