import React, { useState } from "react";
import {
    TextField,
    Button,
    Box,
    Paper,
    Typography,
    CircularProgress,
    Alert,
} from "@mui/material";
import AnalysisResults from "./AnalysisResults";
import { AnalysisResult } from "../types/FormTypes";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const parseAnalysisResult = (text: string) => {
    // split into sections
    const sections = text.split("\n\n").reduce((acc, block) => {
        const [titleLine, ...body] = block.split("\n");
        const key = titleLine
            .replace(":", "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "_");
        acc[key] = body.map((line) => line.replace(/^- /, "").trim());
        return acc;
    }, {} as Record<string, string[]>);

    return {
        analysis: {
            market_position: {
                competitors: sections["market_position"].filter((l) =>
                    l.match(/%/)
                ),
                market_share: sections["market_position"].filter((l) =>
                    /\d+%/.test(l)
                ),
                positioning: sections["market_position"].filter(
                    (l) => !/\d+%/.test(l)
                ),
            },
            growth_potential: {
                opportunities: sections["growth_potential"].filter(
                    (l) => l.match(/opportun/i) || /\d+%/.test(l)
                ),
                risks: sections["growth_potential"].filter(
                    (l) => /risk/i.test(l) || /\bweeks\b/.test(l)
                ),

                growth_indicators: sections["growth_potential"].filter((l) =>
                    /\+?\d+%/.test(l)
                ),
            },
            operational_insights: {
                processes: sections["operational_insights"].filter((l) =>
                    /reduce|streamline/i.test(l)
                ),
                resources: sections["operational_insights"].filter((l) =>
                    /hire|contract/i.test(l)
                ),
                efficiency_metrics: sections["operational_insights"].filter(
                    (l) => /track/i.test(l)
                ),
            },
            strategic_recommendations: sections[
                "strategic_recommendations"
            ].map((line) => {
                const [action, priorityPart] = line.split("Priority:");
                const priority = (priorityPart || "").trim().toLowerCase() as
                    | "high"
                    | "medium"
                    | "low";
                return {
                    action: action.trim(),
                    context: "",
                    priority: priority || "medium",
                };
            }),
        },
    };
};

const formatAnalysisResults = (text) => {
    const sections = text.split(
        /(?=Market Position:|Growth Potential:|Operational Insights:|Strategic Recommendations:)/g
    );

    return sections
        .filter((section) => section.trim())
        .map((section) => {
            const [heading, ...contentParts] = section.split("\n");

            const content = contentParts
                .filter((line) => line.trim())
                .map((line) => line.trim());

            return {
                heading: heading.trim(),
                content: content,
            };
        });
};

const BusinessForm = () => {
    const [formData, setFormData] = useState({
        // Section 1
        email: "",
        full_name: "",

        // Section 2 - General Business Information
        company_name: "",
        industry_niche: "",
        years_in_business: "",
        number_of_employees: "",
        annual_revenue: "",
        geographic_locations: "",

        // Section 3 - Current State Assessment
        main_products: "",
        current_performance: "",
        biggest_challenges: "",

        // Section 4 - Ideal State Vision
        business_vision: "",
        primary_goals: "",
        specific_outcomes: "",

        // Section 5 - Market Research
        market_research: "",
        target_customers: "",
        main_competitors: "",

        // Section 6 - Branding
        brand_identity: "",
        brand_values: "",
        brand_assets: "",

        // Section 7 - Operations Setup
        organizational_structure: "",
        operations_management: "",
        operational_challenges: "",

        // Section 8 - Business Plan and Goals
        business_plan: "",
        business_goals: "",
        progress_tracking: "",
        business_description: "",

        // Section 9 - Additional Information
        additional_info: "",
        specific_questions: "",
    });

    const [statusMessage, setStatusMessage] = useState<string>("");
    const [analysisResults, setAnalysisResults] = useState<string | null>(null);

    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
        null
    );
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [reportId, setReportId] = useState<number | null>(null);
    const analysisResultsStyles = {
        container: {
            padding: "20px",
            backgroundColor: "#f9f9f9",
            borderRadius: "8px",
            marginTop: "30px",
        },
        header: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            borderBottom: "2px solid #eee",
            paddingBottom: "10px",
        },
        section: {
            marginBottom: "30px",
        },
        sectionHeading: {
            fontSize: "1.3rem",
            color: "#2a5885",
            marginBottom: "15px",
            fontWeight: "bold",
        },
        sectionContent: {
            lineHeight: "1.6",
        },
        paragraph: {
            marginBottom: "10px",
        },
        button: {
            marginTop: "20px",
            marginRight: "10px",
            backgroundColor: "#3498db",
            color: "white",
            border: "none",
            borderRadius: "4px",
            padding: "10px 15px",
            cursor: "pointer",
            "&:hover": {
                backgroundColor: "#2980b9",
            },
        },
    };

    const parseAnalysisResult = (text: string) => {
        const sections = text.split("\n\n");

        const extractSection = (section: string, label: string) =>
            section
                .replace(label, "")
                .split("\n")
                .map((line) => line.replace(/^- /, "").trim())
                .filter(Boolean);

        const marketPositionSection =
            sections.find((s) => s.startsWith("Market Position:")) || "";
        const growthSection =
            sections.find((s) => s.startsWith("Growth Potential:")) || "";
        const operationsSection =
            sections.find((s) => s.startsWith("Operational Insights:")) || "";
        const strategySection =
            sections.find((s) => s.startsWith("Strategic Recommendations:")) ||
            "";

        return {
            analysis: {
                market_position: {
                    competitors: extractSection(
                        marketPositionSection,
                        "Market Position:"
                    ),
                    market_share: [],
                    positioning: [],
                },
                growth_potential: {
                    opportunities: extractSection(
                        growthSection,
                        "Growth Potential:"
                    ),
                    risks: [],
                    growth_indicators: [],
                },
                operational_insights: {
                    processes: extractSection(
                        operationsSection,
                        "Operational Insights:"
                    ),
                    resources: [],
                    efficiency_metrics: [],
                },
                strategic_recommendations: extractSection(
                    strategySection,
                    "Strategic Recommendations:"
                ).map((line) => ({
                    action: line,
                    context: "General",
                    priority: "medium",
                })),
            },
        };
    };

    const fetchReportContent = async (reportId: number) => {
        setStatusMessage(`Fetching report content for ID: ${reportId}...`);
        try {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
                throw new Error(
                    "Authentication token missing for fetching report."
                );
            }

            const reportResponse = await fetch(
                `${API_BASE_URL}/api/reports/${reportId}/`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            if (!reportResponse.ok) {
                const errorData = await reportResponse
                    .json()
                    .catch(() => ({ detail: reportResponse.statusText }));
                let errorMessage =
                    errorData.detail ||
                    (typeof errorData === "object"
                        ? JSON.stringify(errorData)
                        : reportResponse.statusText);
                throw new Error(
                    `Failed to fetch report (${reportResponse.status}): ${errorMessage}`
                );
            }

            const reportData = await reportResponse.json();
            console.log("Report Content:", reportData);
            setAnalysisResult(reportData);
            setStatusMessage("Analysis report fetched successfully!");
        } catch (fetchError: any) {
            console.error("Error fetching report content:", fetchError.message);
            setError((prevError) =>
                prevError
                    ? `${prevError}\nThen, error fetching report: ${fetchError.message}`
                    : `Error fetching report: ${fetchError.message}`
            );
            setStatusMessage("Failed to fetch analysis report.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const token = localStorage.getItem("accessToken");
        if (!token) {
            console.error("No access token found - user may not be logged in");
            setError("You are not logged in. Please log in to continue.");
            setIsLoading(false);
            return;
        }

        console.log("Using token:", token.substring(0, 20) + "...");

        try {
            const refreshToken = localStorage.getItem("refreshToken");
            let accessToken = token;

            if (refreshToken) {
                try {
                    const refreshResponse = await fetch(
                        `${API_BASE_URL}/api/token/refresh/`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                refresh: refreshToken,
                            }),
                        }
                    );

                    if (refreshResponse.ok) {
                        const refreshData = await refreshResponse.json();
                        accessToken = refreshData.access;
                        localStorage.setItem("accessToken", accessToken);
                        console.log("Token refreshed successfully");
                    } else {
                        console.warn(
                            "Token refresh returned non-OK response:",
                            refreshResponse.status
                        );
                    }
                } catch (refreshError) {
                    console.error("Token refresh failed:", refreshError);
                }
            }

            const response = await fetch(`${API_BASE_URL}/api/analyze/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(formData),
            });

            console.log("Response status:", response.status);

            const responseData = await response.json();
            console.log("Response data:", responseData);

            if (!response.ok) {
                throw new Error(
                    `Analysis submission failed (${response.status}): ${
                        responseData.error ||
                        responseData.detail ||
                        "Unknown error"
                    }`
                );
            }

            setAnalysisResults(responseData.analysis_results);
            setReportId(responseData.report_id);
        } catch (error) {
            console.error("Error during submission or fetch trigger:", error);
            setError(error.message || "An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    function displayArray(competitors: any): React.ReactNode {
        throw new Error("Function not implemented.");
    }

    const displayObjectArray = (
        arr: { action: string; context: string; priority: string }[]
    ) => {
        return arr.map((item, index) => (
            <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="body1">
                    <strong>Action:</strong> {item.action}
                </Typography>
                <Typography variant="body1">
                    <strong>Context:</strong> {item.context}
                </Typography>
                <Typography variant="body1">
                    <strong>Priority:</strong> {item.priority}
                </Typography>
            </Box>
        ));
    };

    return (
        <div>
            <Paper elevation={3} sx={{ p: 4, m: 2, maxWidth: 800, mx: "auto" }}>
                {!analysisResults ? (
                    <>
                        <Typography variant="h4" gutterBottom>
                            NMCD Inc. Online Consultation Intake Form
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 3 }}>
                            Time: 15 to 30 minutes to thoroughly complete the
                            assessment.
                        </Typography>

                        <form onSubmit={handleSubmit}>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 3,
                                }}
                            >
                                {/* Section 1 */}
                                <Typography variant="h5" sx={{ mt: 2 }}>
                                    Section 1 of 9
                                </Typography>
                                <TextField
                                    required
                                    name="email"
                                    label="Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    helperText="This form is collecting emails"
                                />
                                <TextField
                                    required
                                    name="full_name"
                                    label="Your Full Name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                />
                                {/* Section 2 */}
                                <Typography variant="h5">
                                    Section 2 of 9 - General Business
                                    Information
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="textSecondary"
                                >
                                    Description (optional)
                                </Typography>
                                <TextField
                                    required
                                    name="company_name"
                                    label="Company Name"
                                    value={formData.company_name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            company_name: e.target.value,
                                        })
                                    }
                                />
                                <TextField
                                    required
                                    name="industry_niche"
                                    label="Industry/Niche"
                                    value={formData.industry_niche}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            industry_niche: e.target.value,
                                        })
                                    }
                                />
                                <TextField
                                    required
                                    name="years_in_business"
                                    label="Years in Business"
                                    value={formData.years_in_business}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            years_in_business: e.target.value,
                                        })
                                    }
                                />
                                <TextField
                                    required
                                    name="number_of_employees"
                                    label="Number of Employees"
                                    value={formData.number_of_employees}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            number_of_employees: e.target.value,
                                        })
                                    }
                                />
                                <TextField
                                    required
                                    name="annual_revenue"
                                    label="Annual Revenue (approximate)"
                                    value={formData.annual_revenue}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            annual_revenue: e.target.value,
                                        })
                                    }
                                />
                                <TextField
                                    required
                                    name="geographic_locations"
                                    label="Geographic Location(s) of Operations"
                                    value={formData.geographic_locations}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            geographic_locations:
                                                e.target.value,
                                        })
                                    }
                                />
                                {/* 

                {/* Section 3 */}
                                <Typography variant="h5">
                                    Section 3 of 9 - Current State Assessment
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="textSecondary"
                                >
                                    Description (optional)
                                </Typography>
                                <TextField
                                    required
                                    multiline
                                    rows={3}
                                    name="main_products"
                                    label="What are the main products/services offered by your business?"
                                    value={formData.main_products}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            main_products: e.target.value,
                                        })
                                    }
                                />
                                <TextField
                                    required
                                    name="current_performance"
                                    label="What are the biggest challenges or obstacles you currently face in your business?"
                                    value={formData.current_performance}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            current_performance: e.target.value,
                                        })
                                    }
                                />
                                <TextField
                                    required
                                    name="biggest_challenges"
                                    label="Biggest Challenges"
                                    value={formData.biggest_challenges}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            biggest_challenges: e.target.value,
                                        })
                                    }
                                />
                                <Typography variant="h5">
                                    Section 4 of 9 - Ideal State Vision
                                </Typography>
                                <TextField
                                    required
                                    name="business_vision"
                                    label="What is your vision for the future of your business? Where do you see your business in the next 1-3 years?"
                                    value={formData.business_vision}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            business_vision: e.target.value,
                                        })
                                    }
                                />
                                <TextField
                                    required
                                    name="primary_goals"
                                    label="What are your primary goals and objectives for your business in the short term (next 6-12 months) and long term (next 1-3 years)?"
                                    value={formData.primary_goals}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            primary_goals: e.target.value,
                                        })
                                    }
                                />
                                <TextField
                                    required
                                    name="specific_outcomes"
                                    label="What specific outcomes or achievements would indicate success for your business?"
                                    value={formData.specific_outcomes}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            specific_outcomes: e.target.value,
                                        })
                                    }
                                />
                                <Typography variant="h5">
                                    Section 5 of 9 - Brand Research
                                </Typography>
                                <TextField
                                    required
                                    name="market_research"
                                    label="Have you conducted any market research or analysis for your business? If yes, please provide details."
                                    value={formData.market_research}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            market_research: e.target.value,
                                        })
                                    }
                                />
                                <TextField
                                    required
                                    name="target_customers"
                                    label="Who are your target customers/clients? What are their demographics, preferences, and pain points?"
                                    value={formData.target_customers}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            target_customers: e.target.value,
                                        })
                                    }
                                />
                                <TextField
                                    required
                                    name="main_competitors"
                                    label="Who are your main competitors, and what sets your business apart from them?"
                                    value={formData.main_competitors}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            main_competitors: e.target.value,
                                        })
                                    }
                                />
                                <Typography variant="h5">
                                    Section 6 of 9 - Branding
                                </Typography>
                                <TextField
                                    required
                                    name="brand_identity"
                                    label="How would you describe your current brand identity and positioning in the market?"
                                    value={formData.brand_identity}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            brand_identity: e.target.value,
                                        })
                                    }
                                />
                                <TextField
                                    required
                                    name="brand_values"
                                    label="What values or attributes do you want your brand to be associated with?
        "
                                    value={formData.brand_values}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            brand_values: e.target.value,
                                        })
                                    }
                                />
                                <TextField
                                    required
                                    name="brand_assets"
                                    label="Do you have existing brand assets (logo, tagline, etc.)? If yes, please provide details."
                                    value={formData.brand_assets}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            brand_assets: e.target.value,
                                        })
                                    }
                                />
                                <Typography variant="h5">
                                    Section 7 of 9 - Operations Setup
                                </Typography>
                                <TextField
                                    required
                                    name="organizational_structure"
                                    label="What is your current organizational structure? Who are the key decision-makers and stakeholders in your business?"
                                    value={formData.organizational_structure}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            organizational_structure:
                                                e.target.value,
                                        })
                                    }
                                />
                                <TextField
                                    required
                                    name="operations_management"
                                    label="How do you currently manage day-to-day operations, including workflow, communication, and resource allocation?"
                                    value={formData.operations_management}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            operations_management:
                                                e.target.value,
                                        })
                                    }
                                />
                                <TextField
                                    required
                                    name="operational_challenges"
                                    label="Are there any specific operational challenges or inefficiencies you would like to address?"
                                    value={formData.operational_challenges}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            operational_challenges:
                                                e.target.value,
                                        })
                                    }
                                />
                                <Typography variant="h5">
                                    Section 8 of 9 - Business Goals and Plans
                                </Typography>
                                <TextField
                                    required
                                    name="business_plan"
                                    label="Do you have a formal business plan in place? If yes, please provide a summary or outline."
                                    value={formData.business_plan}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            business_plan: e.target.value,
                                        })
                                    }
                                />
                                <TextField
                                    required
                                    name="business_goals"
                                    label="What are your main business goals and objectives for the short term and long term?"
                                    value={formData.business_goals}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            business_goals: e.target.value,
                                        })
                                    }
                                />
                                <TextField
                                    required
                                    name="progress_tracking"
                                    label="How do you plan to measure and track progress toward your business goals?
        "
                                    value={formData.progress_tracking}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            progress_tracking: e.target.value,
                                        })
                                    }
                                />
                                <TextField
                                    required
                                    multiline
                                    rows={4}
                                    name="business_description"
                                    label="How do you describe your business in three words?"
                                    value={formData.business_description}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            business_description:
                                                e.target.value,
                                        })
                                    }
                                />
                                <TextField
                                    required
                                    multiline
                                    rows={4}
                                    name="additional_info"
                                    label="Is there any other information or context you believe is important for us to know about your business?"
                                    value={formData.additional_info}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            additional_info: e.target.value,
                                        })
                                    }
                                />
                                <TextField
                                    required
                                    multiline
                                    rows={4}
                                    name="specific_questions"
                                    label="Do you have any specific questions or areas of focus you would like us to address during our consultation?"
                                    value={formData.specific_questions}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            specific_questions: e.target.value,
                                        })
                                    }
                                />

                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                        mt: 2,
                                    }}
                                >
                                    {isLoading ? (
                                        <CircularProgress /> // Loading indicator
                                    ) : (
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            color="primary"
                                        >
                                            Submit
                                        </Button>
                                    )}
                                </Box>

                                {error && (
                                    <Alert severity="error">{error}</Alert>
                                )}
                            </Box>
                        </form>
                    </>
                ) : (
                    // Analysis results display
                    <Box sx={analysisResultsStyles.container}>
                        <Box sx={analysisResultsStyles.header}>
                            <Typography variant="h4">
                                Business Analysis Results
                            </Typography>
                            {reportId && (
                                <Typography variant="body2">
                                    Report ID: {reportId}
                                </Typography>
                            )}
                        </Box>

                        <Box>
                            {formatAnalysisResults(analysisResults).map(
                                (section, index) => (
                                    <Box
                                        key={index}
                                        sx={analysisResultsStyles.section}
                                    >
                                        <Typography
                                            variant="h5"
                                            sx={
                                                analysisResultsStyles.sectionHeading
                                            }
                                        >
                                            {section.heading}
                                        </Typography>
                                        <Box
                                            sx={
                                                analysisResultsStyles.sectionContent
                                            }
                                        >
                                            {section.content.map(
                                                (paragraph, i) => (
                                                    <Typography
                                                        key={i}
                                                        variant="body1"
                                                        sx={
                                                            analysisResultsStyles.paragraph
                                                        }
                                                    >
                                                        {paragraph}
                                                    </Typography>
                                                )
                                            )}
                                        </Box>
                                    </Box>
                                )
                            )}
                        </Box>

                        <Box sx={{ mt: 4 }}>
                            <Button
                                variant="contained"
                                onClick={() => setAnalysisResults(null)}
                                sx={{ mr: 2 }}
                            >
                                Back to Form
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => window.print()}
                            >
                                Print Report
                            </Button>
                        </Box>
                    </Box>
                )}
            </Paper>
        </div>
    );
};

export default BusinessForm;
