import React from 'react'
import RootLayout from '../../../layout/RootLayout'
import TopSearchCard from '../../../components/topsearch/TopSearchCard'

const TopSearch = () => {
    return (
        <RootLayout className="space-y-12">

            {/* Tag */}
            <div className="w-full flex items-center justify-center text-center">
                <h1 className="text-3xl text-neutral-800 font-bold">
                    Top Search <span className="text-primary">Routes</span>
                </h1>
            </div>

            {/* Top Search tickets routes card */}
            <div className="w-full grid grid-cols-3 gap-5">
                <TopSearchCard routeFrom={"Kathmandu"} routeTo={"Janakpur"} timeDuration={"12 Hrs"} price={"1000"} />
                <TopSearchCard routeFrom={"Kathmandu"} routeTo={"Pokhara"} timeDuration={"12 Hrs"} price={"1000"} />
                <TopSearchCard routeFrom={"Kathmandu"} routeTo={"Biratnagar"} timeDuration={"12 Hrs"} price={"1000"} />
                <TopSearchCard routeFrom={"Janakpur"} routeTo={"Kathmandu"} timeDuration={"12 Hrs"} price={"1000"} />
                <TopSearchCard routeFrom={"Pokhara"} routeTo={"Kathmandu"} timeDuration={"12 Hrs"} price={"1000"} />
                <TopSearchCard routeFrom={"Biratnagar"} routeTo={"Kathmandu"} timeDuration={"12 Hrs"} price={"1000"} />
            </div>

        </RootLayout>
    )
}

export default TopSearch
