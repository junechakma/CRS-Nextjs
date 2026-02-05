"use client"

import { useState } from "react"
import { HeaderSection } from "./users-wrapper"
import UsersPageClient from "./users-client"
import { UserWithStats } from "@/lib/supabase/queries"

interface UsersContentWrapperProps {
    initialUsers: UserWithStats[]
    totalCount: number
    currentPage: number
    totalPages: number
    pageSize: number
    initialSearch: string
    initialStatus: string
    initialPlan: string
}

export function UsersContentWrapper(props: UsersContentWrapperProps) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)

    return (
        <>
            {/* Pass the modal state handler to the client component */}
            <UsersPageClient
                {...props}
                externalAddModalOpen={isAddModalOpen}
                onSetAddModalOpen={setIsAddModalOpen}
            />
        </>
    )
}

interface StaticHeaderWrapperProps {
    onAddUser: () => void
}

export function StaticHeaderWrapper({ onAddUser }: StaticHeaderWrapperProps) {
    return <HeaderSection isPending={false} onAddUser={onAddUser} />
}
