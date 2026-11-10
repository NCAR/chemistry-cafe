using System.Text.Json;

namespace ChemistryCafeAPI.Models;

/// <summary>
/// Helper methods for comparing and cloning JSON custom property dictionaries across models.
/// </summary>
public static class PropertyComparisonHelper
{
    public static bool AreEqual(Dictionary<string, JsonElement>? dict1, Dictionary<string, JsonElement>? dict2)
    {
        int count1 = dict1?.Count ?? 0;
        int count2 = dict2?.Count ?? 0;
        if (count1 == 0 && count2 == 0) return true;
        if (count1 != count2) return false;
        foreach (var (key, val1) in dict1!)
        {
            if (!dict2!.TryGetValue(key, out var val2)) return false;
            if (!AreElementsEqual(val1, val2)) return false;
        }
        return true;
    }

    private static bool AreElementsEqual(JsonElement el1, JsonElement el2)
    {
        if (el1.ValueKind != el2.ValueKind) return false;
        return el1.ValueKind switch
        {
            JsonValueKind.Null or JsonValueKind.Undefined or JsonValueKind.True or JsonValueKind.False => true,
            JsonValueKind.String => el1.GetString() == el2.GetString(),
            JsonValueKind.Number => el1.TryGetDouble(out double d1) && el2.TryGetDouble(out double d2)
                ? d1 == d2
                : el1.GetRawText() == el2.GetRawText(),
            JsonValueKind.Array => el1.GetArrayLength() == el2.GetArrayLength()
                && el1.EnumerateArray().Zip(el2.EnumerateArray()).All(pair => AreElementsEqual(pair.First, pair.Second)),
            JsonValueKind.Object => AreObjectsEqual(el1, el2),
            _ => el1.GetRawText() == el2.GetRawText(),
        };
    }

    private static bool AreObjectsEqual(JsonElement obj1, JsonElement obj2)
    {
        var props1 = obj1.EnumerateObject().ToDictionary(p => p.Name, p => p.Value);
        var props2 = obj2.EnumerateObject().ToDictionary(p => p.Name, p => p.Value);
        if (props1.Count != props2.Count) return false;
        foreach (var (k, v1) in props1)
        {
            if (!props2.TryGetValue(k, out var v2)) return false;
            if (!AreElementsEqual(v1, v2)) return false;
        }
        return true;
    }

    public static bool IsDifferentFrom(this Dictionary<string, JsonElement>? dict1, Dictionary<string, JsonElement>? dict2)
        => !AreEqual(dict1, dict2);

    public static Dictionary<string, JsonElement>? CloneDictionary(this Dictionary<string, JsonElement>? dict)
        => dict != null ? new Dictionary<string, JsonElement>(dict) : null;
}

