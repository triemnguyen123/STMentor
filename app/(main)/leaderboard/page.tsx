import { FeedWrapper } from "@/components/feed-wrapper";
import { UserProgress } from "@/components/user-progress";
import { StickyWrapper } from "@/components/sticky-wrapper";

import { Header } from "./header";

// Component hiển thị mỗi hàng trong bảng xếp hạng
const RankRow = ({ rank, name, score }: { rank: number, name: string, score: number }) => (
    <div className="flex justify-between items-center border-b py-2">
        <div className="flex items-center">
            <span className="text-lg font-bold mr-2">{rank}</span>
            <span>{name}</span>
        </div>
        <span>{score}</span>
    </div>
);

const Leaderboard = () => {
    // Dữ liệu giả lập cho bảng xếp hạng
    const leaderboardData = [
        { name: 'Nguyễn Văn A', score: 100 },
        { name: 'Nguyễn Văn B', score: 90 },
        { name: 'Nguyễn Văn C', score: 80 },
        // thêm nhiều dữ liệu hơn ở đây
    ];

    return (
        <div className="flex flex-row-reverse gap-[48px] px-6">
            <FeedWrapper>
                <Header title="Bảng xếp hạng" />
                <div className="mb-10">
                    {leaderboardData.map((data, index) => (
                        <RankRow key={index} rank={index + 1} name={data.name} score={data.score} />
                    ))}
                </div>
            </FeedWrapper>
        </div>
    );
};

export default Leaderboard;