SELECT TOP 100 *,(Positivity - Negativity) AS Sentiment, (Frequency - Positivity - Negativity) AS Neutrality FROM (SELECT EntityValue, EntUniId AS EntityId, SUM(IsPositive) AS Positivity, SUM(IsNegative) AS Negativity, COUNT(EntUniId) AS Frequency, Dominance, Spread, Domspread FROM KM.Part WHERE EntTypeId=0 AND MainCategory=10006 GROUP BY EntUniId)
WHERE (Positivity - Negativity) != 0
ORDER BY Frequency DESC