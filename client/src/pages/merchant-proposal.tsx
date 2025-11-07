import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Building2, Loader, RefreshCw } from "lucide-react";
import { type Merchant, type Volunteer } from "@shared/schema";
import SearchFilters from "@/components/search-filters";
import MerchantCard from "@/components/merchant-card";
import AssignmentModal from "@/components/assignment-modal";
import { apiRequest } from "@/lib/queryClient";

export default function MerchantProposal() {
    return (
        <iframe src="https://docs.google.com/forms/d/e/1FAIpQLSe5YdN0NhmTP8RIpSxI_4CXRbV-3ShIjCHfv4TDzX76R1Ui2g/viewform?embedded=true" width="100%" height="1000" frameborder="0" marginheight="0" marginwidth="0">Loading…</iframe>
    )
}