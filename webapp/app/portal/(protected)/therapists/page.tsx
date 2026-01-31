import { IconMapPin, IconUser } from "@tabler/icons-react"
import { getClientTherapistsAction } from "@/app/actions/client-portal"

export default async function PortalTherapistsPage() {
  const result = await getClientTherapistsAction()
  const therapists = result.data || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Therapists
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Therapists you are working with.
        </p>
      </div>

      {therapists.length === 0 ? (
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-12 text-center">
          <IconUser className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No therapists yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            You haven&apos;t been connected with any therapists yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {therapists.map((therapist) => (
            <div
              key={therapist.id}
              className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-100 dark:bg-neutral-700 rounded-full flex items-center justify-center flex-shrink-0">
                  {therapist.photoUrl ? (
                    <img
                      src={therapist.photoUrl}
                      alt={therapist.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-semibold text-gray-600 dark:text-gray-300">
                      {therapist.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {therapist.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {therapist.professionalTitle || "Hypnotherapist"}
                  </p>
                  {(therapist.city || therapist.country) && (
                    <p className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-2">
                      <IconMapPin className="w-4 h-4" />
                      {[therapist.city, therapist.country].filter(Boolean).join(", ")}
                    </p>
                  )}
                  <div className="mt-3">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        therapist.relationshipStatus === "active"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          : therapist.relationshipStatus === "paused"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {therapist.relationshipStatus === "active"
                        ? "Active"
                        : therapist.relationshipStatus === "paused"
                        ? "Paused"
                        : "Ended"}
                    </span>
                  </div>
                  {therapist.startedAt && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      Working together since{" "}
                      {new Date(therapist.startedAt).toLocaleDateString("en-GB", {
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
