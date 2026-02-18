import TeamForm from "@/app/components/TeamForm";

export default function NewTeamMemberPage() {
    return (
        <div className="mx-auto max-w-2xl px-4 py-8">
            <h1 className="mb-8 text-2xl font-bold text-gray-900">Add New Team Member</h1>
            <TeamForm />
        </div>
    );
}
