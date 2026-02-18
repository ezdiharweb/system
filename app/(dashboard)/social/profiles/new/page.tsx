import SocialProfileForm from "@/app/components/SocialProfileForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewSocialProfile() {
    return (
        <div className="space-y-6">
            <div>
                <Link
                    href="/social"
                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
                >
                    <ArrowLeft size={16} className="mr-1" />
                    Back to Social Media
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">
                    New Social Media Profile
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                    Select an existing client and configure their social media profile for
                    AI content generation
                </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <SocialProfileForm />
            </div>
        </div>
    );
}
