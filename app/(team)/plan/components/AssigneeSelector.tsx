import memberApi from "@/api/memberApi";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

interface Member {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface AssigneeSelectorProps {
  teamId: string;
  selectedAssigneeId?: string;
  onAssigneeChange: (assigneeId: string) => void;
}

export default function AssigneeSelector({
  teamId,
  selectedAssigneeId,
  onAssigneeChange,
}: AssigneeSelectorProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedAssignee, setSelectedAssignee] = useState<Member | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!teamId) return;

    let isMounted = true;

    const loadMembers = async () => {
      setLoading(true);
      try {
        const res = await memberApi.getAll(teamId);
        if (!isMounted) return;

        const mapped: Member[] = (res.members || []).map((m) => ({
          id: m.userId,
          name: m.name,
          avatarUrl: m.avatarUrl,
        }));

        setMembers(mapped);

        const selected =
          mapped.find((m) => m.id === selectedAssigneeId) ?? mapped[0];

        if (selected) {
          setSelectedAssignee(selected);
          onAssigneeChange(selected.id);
        }
      } catch (error) {
        if (!isMounted) return;

        // Fallback mock
        const mock: Member[] = [
          {
            id: "1",
            name: "Nguyetlun115",
            avatarUrl: "https://i.pravatar.cc/40?img=1",
          },
          {
            id: "2",
            name: "Minh Huy",
            avatarUrl: "https://i.pravatar.cc/40?img=2",
          },
          {
            id: "3",
            name: "Minh Hoàng",
            avatarUrl: "https://i.pravatar.cc/40?img=3",
          },
        ];

        setMembers(mock);
        setSelectedAssignee(mock[0]);
        onAssigneeChange(mock[0].id);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadMembers();

    return () => {
      isMounted = false;
    };
  }, [teamId, selectedAssigneeId, onAssigneeChange]);

  return (
    <View className="bg-[#F8F6F7] px-2.5 py-2 gap-2">
      {/* Title */}
      <Text className="text-base font-semibold text-[#0F0C0D] px-2">
        Assignee
      </Text>

      {/* Selector */}
      <Pressable
        onPress={() => setShowDropdown((prev) => !prev)}
        className="flex-row items-center justify-between h-[43px] rounded-[12.5px] border border-[#79747E] px-6 bg-[#F8F6F7]"
      >
        {loading ? (
          <ActivityIndicator size="small" color="#90717E" />
        ) : selectedAssignee ? (
          <View className="flex-row items-center gap-3">
            {selectedAssignee.avatarUrl ? (
              <Image
                source={{ uri: selectedAssignee.avatarUrl }}
                className="w-[30px] h-[30px] rounded-full"
              />
            ) : (
              <View className="w-[30px] h-[30px] rounded-full bg-[#90717E] items-center justify-center">
                <Text className="text-white font-semibold">
                  {selectedAssignee.name[0]}
                </Text>
              </View>
            )}
            <Text className="text-[15px] text-[#0F0C0D]">
              {selectedAssignee.name}
            </Text>
          </View>
        ) : (
          <Text className="text-[15px] text-[#79747E]">Select assignee</Text>
        )}

        <Ionicons
          name={showDropdown ? "chevron-up" : "chevron-down"}
          size={26}
          color="#90717E"
        />
      </Pressable>

      {/* Dropdown */}
      {showDropdown && (
        <View className="mt-1 rounded-xl border border-[#E3DBDF] bg-white max-h-[200px] overflow-hidden">
          <ScrollView>
            {members.map((member) => {
              const active = member.id === selectedAssignee?.id;
              return (
                <Pressable
                  key={member.id}
                  onPress={() => {
                    setSelectedAssignee(member);
                    onAssigneeChange(member.id);
                    setShowDropdown(false);
                  }}
                  className={`flex-row items-center px-3 py-3 border-b border-[#F2EFF0] ${
                    active ? "bg-[#F8F6F7]" : ""
                  }`}
                >
                  <Image
                    source={{ uri: member.avatarUrl }}
                    className="w-8 h-8 rounded-full mr-3"
                  />
                  <Text className="flex-1 text-base text-[#0F0C0D]">
                    {member.name}
                  </Text>
                  {active && (
                    <Ionicons name="checkmark" size={18} color="#90717E" />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
