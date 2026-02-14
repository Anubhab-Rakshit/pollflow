import { Coffee, Utensils, Film, Calendar, CheckSquare, Zap } from "lucide-react";

export interface Template {
    id: string;
    name: string;
    icon: any;
    question: string;
    options: string[];
    color: string;
}

export const POPULAR_TEMPLATES: Template[] = [
    {
        id: "daily-standup",
        name: "Daily Standup",
        icon: CheckSquare,
        question: "How are you blocked today?",
        options: ["Not blocked", "Need code review", "Waiting on design", "Environment issues", "Need help"],
        color: "from-blue-500 to-cyan-500"
    },
    {
        id: "team-lunch",
        name: "Team Lunch",
        icon: Utensils,
        question: "Where should we go for lunch?",
        options: ["Pizza 🍕", "Sushi 🍣", "Burgers 🍔", "Salad 🥗", "Tacos 🌮"],
        color: "from-orange-500 to-amber-500"
    },
    {
        id: "movie-night",
        name: "Movie Night",
        icon: Film,
        question: "What genre specifically?",
        options: ["Action", "Comedy", "Sci-Fi", "Horror", "Documentary"],
        color: "from-purple-500 to-pink-500"
    },
    {
        id: "meeting-time",
        name: "Best Meeting Time",
        icon: Calendar,
        question: "When works best for everyone?",
        options: ["Weighted heavily towards Morning", "After lunch", "Late afternoon", "Tomorrow instead"],
        color: "from-emerald-500 to-teal-500"
    },
    {
        id: "quick-check",
        name: "Quick Vibe Check",
        icon: Zap,
        question: "How is everyone feeling about the sprint?",
        options: ["Confident 🚀", "Good 👍", "Nervous 😬", "Stressed 😫", "Help! 🆘"],
        color: "from-yellow-400 to-orange-500"
    }
];

export const KEYWORD_SUGGESTIONS: Record<string, string[]> = {
    "pizza": ["Pepperoni", "Cheese", "Mushrooms", "Hawaiian", "Meat Lovers", "Veggie"],
    "coffee": ["Espresso", "Latte", "Cappuccino", "Cold Brew", "Tea instead"],
    "meeting": ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM"],
    "day": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "rating": ["⭐⭐⭐⭐⭐", "⭐⭐⭐⭐", "⭐⭐⭐", "⭐⭐", "⭐"],
    "feedback": ["Great work!", "Good", "Needs improvement", "Unsatisfactory"],
    "priority": ["P0 - Critical", "P1 - High", "P2 - Medium", "P3 - Low"],
    "sprint": ["On track", "Behind schedule", "Ahead of schedule", "Blocked"],
    "framework": ["React", "Vue", "Angular", "Svelte", "Solid"],
    "language": ["TypeScript", "JavaScript", "Python", "Go", "Rust"]
};
