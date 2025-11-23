import * as fs from 'fs';
import * as path from 'path';
import { JobApplication, AgentMemory, MemoryFilter } from './types.js';

export class MemoryStore {
    private memory: AgentMemory;
    private filepath: string;

    constructor(filepath: string = './memory.json') {
        this.filepath = filepath;
        this.memory = this.load();
    }

    /**
     * Load memory from file or create new
     */
    private load(): AgentMemory {
        try {
            if (fs.existsSync(this.filepath)) {
                const data = fs.readFileSync(this.filepath, 'utf-8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.warn('Failed to load memory, creating new:', error);
        }

        return {
            applications: [],
            stats: {
                totalApplications: 0,
                successfulApplications: 0,
                failedApplications: 0,
            },
        };
    }

    /**
     * Save memory to file
     */
    save(): void {
        try {
            const dir = path.dirname(this.filepath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(this.filepath, JSON.stringify(this.memory, null, 2));
            console.log(`Memory saved to ${this.filepath}`);
        } catch (error) {
            console.error('Failed to save memory:', error);
        }
    }

    /**
     * Add a new job application
     */
    addApplication(application: Omit<JobApplication, 'id' | 'appliedAt'>): JobApplication {
        const newApp: JobApplication = {
            ...application,
            id: this.generateId(),
            appliedAt: new Date().toISOString(),
        };

        this.memory.applications.push(newApp);
        this.memory.stats.totalApplications++;
        this.memory.lastRun = new Date().toISOString();

        this.save();
        return newApp;
    }

    /**
     * Check if already applied to a job
     */
    hasApplied(url: string): boolean {
        return this.memory.applications.some(app => app.url === url);
    }

    /**
     * Get application by URL
     */
    getApplicationByUrl(url: string): JobApplication | undefined {
        return this.memory.applications.find(app => app.url === url);
    }

    /**
     * Get all applications with optional filters
     */
    getApplications(filter?: MemoryFilter): JobApplication[] {
        let results = this.memory.applications;

        if (filter) {
            if (filter.company) {
                results = results.filter(app =>
                    app.company.toLowerCase().includes(filter.company!.toLowerCase())
                );
            }
            if (filter.status) {
                results = results.filter(app => app.status === filter.status);
            }
            if (filter.startDate) {
                results = results.filter(app => app.appliedAt >= filter.startDate!);
            }
            if (filter.endDate) {
                results = results.filter(app => app.appliedAt <= filter.endDate!);
            }
        }

        return results;
    }

    /**
     * Update application status
     */
    updateApplicationStatus(id: string, status: JobApplication['status'], notes?: string): boolean {
        const app = this.memory.applications.find(a => a.id === id);
        if (app) {
            app.status = status;
            if (notes) {
                app.notes = notes;
            }

            if (status === 'applied') {
                this.memory.stats.successfulApplications++;
            } else if (status === 'rejected') {
                this.memory.stats.failedApplications++;
            }

            this.save();
            return true;
        }
        return false;
    }

    /**
     * Get memory statistics
     */
    getStats() {
        return { ...this.memory.stats };
    }

    /**
     * Clear all applications (use with caution)
     */
    clear(): void {
        this.memory = {
            applications: [],
            stats: {
                totalApplications: 0,
                successfulApplications: 0,
                failedApplications: 0,
            },
        };
        this.save();
    }

    /**
     * Generate unique ID
     */
    private generateId(): string {
        return `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
