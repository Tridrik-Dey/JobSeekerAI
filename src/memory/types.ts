export interface JobApplication {
    id: string;
    company: string;
    title: string;
    url: string;
    status: 'pending' | 'applied' | 'rejected' | 'interview' | 'offer';
    appliedAt: string;
    notes?: string;
}

export interface AgentMemory {
    applications: JobApplication[];
    lastRun?: string;
    stats: {
        totalApplications: number;
        successfulApplications: number;
        failedApplications: number;
    };
}

export interface MemoryFilter {
    company?: string;
    status?: JobApplication['status'];
    startDate?: string;
    endDate?: string;
}
