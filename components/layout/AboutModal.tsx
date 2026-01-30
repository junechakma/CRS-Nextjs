"use client"

import { X, Zap } from "lucide-react"

interface AboutModalProps {
    isOpen: boolean
    onClose: () => void
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#468cfe] to-[#3b82f6] rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-blue-200">
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">About Us</h2>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">SAH</span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900">Prof. Dr. Syed Akhter Hossain</h3>
                            <p className="text-slate-500 text-sm">System Architect & Concept Designer</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">JC</span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900">June Chakma</h3>
                            <p className="text-slate-500 text-sm">Lead Developer</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                        <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">MR</span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900">Assoc. Prof. Mahmudur Rahman</h3>
                            <p className="text-slate-500 text-sm">Consultant</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <button
                        onClick={onClose}
                        className="w-full bg-[#468cfe] hover:bg-[#3a7be0] text-white font-medium py-3 rounded-xl transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}
